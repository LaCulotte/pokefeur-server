<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { TradeProposal } from '../../../api/model/interfaces';
import { user } from '../../data/user/vueUserData.ts';
import { computed, type Ref, ref, useTemplateRef } from 'vue';
import LocalScope from '../LocalScope.vue';
import ItemGrid from '../ItemGrid.vue';
import BaseItemComponent from '../item/BaseItemComponent.vue';

const { proposal } = defineProps<{
    proposal: TradeProposal
}>();

const router = useRouter();

const status = computed(() => {
    if (proposal.from.uid == user.data.uid) {
        return { user: proposal.from.accepted, opposite: proposal.to.accepted};
    } else if (proposal.to.uid == user.data.uid) {
        return { user: proposal.to.accepted, opposite: proposal.from.accepted};
    }
    
    return undefined;
});


const globalStatus = computed(() => {
    if (status.value == undefined) {
        return undefined;
    }

    if (status.value.user == 'refused' || status.value.opposite == 'refused') {
        return 'refused';
    } else if (status.value.user == 'pending' || status.value.opposite == 'pending') {
        return 'pending';
    } else if (status.value.user == 'completed') {
        return 'completed';
    }

    return 'accepted';
});

function show(a?: unknown) {
    console.log('a');
    console.log(a);
}

function refuse(proposalUid: string) {
    user.refuseTradeProposal(proposalUid);
}

function accept(proposalUid: string) {
    user.acceptTradeProposal(proposalUid);
}

function complete(proposalUid: string) {
    user.completeTradeProposal(proposalUid);
}

function counter(proposalUid: string) {
    router.push({
        name: "counter-trade-proposal",
        params: {
            proposalUid
        }
    });
}

const dialogScrollElem = useTemplateRef('dialogScrollElem');
</script>

<template>
    <template v-if="status != undefined">
        <v-dialog>
            <template v-slot:activator="{ props }">
                <v-row
                    v-if="globalStatus == 'accepted'"
                    :gap="[5, 10]"
                >
                    <v-btn
                        block
                        color="success"
                        @click.capture.stop="(e: unknown) => { complete(proposal.uid); props['onClick'](e); }"
                    >
                        Complete trade
                    </v-btn>
                </v-row>
            </template>
            <template v-slot="{ isActive }">
                <local-scope
                    :scope="{ receiveSide: user.data.uid == proposal.from.uid ? proposal.to : proposal.from }"
                    v-slot="{ receiveSide }"
                >
                    <v-sheet
                        class="overflow-auto"
                        ref="dialogScrollElem"
                    >
                        <v-sheet
                            class="w-100 pa-2 position-sticky top-0"
                            style="text-align: center; font-weight: 800; font-size: 20px; z-index: 10"
                        >
                            Got new items : 
                        </v-sheet>
                        <v-divider class="mb-2" />
                        <item-grid
                            :item-count="receiveSide.items.length"
                            :min-item-height-ratio="0.15"
                            :max-item-height-ratio="0.15"
                            :scroll-elem="dialogScrollElem?.$el"
                            v-slot="{i}"
                        >
                            <base-item-component :item="receiveSide.items[i % receiveSide.items.length]!" />
                        </item-grid>
                        <v-toolbar class="pl-2 pr-2 position-sticky bottom-0">
                            <v-spacer />
                            <v-btn
                                class="mr-2"
                                color="success"
                                variant="flat"
                                to="/collection"
                            >
                                Go >
                            </v-btn>

                            <v-btn
                                variant="outlined"
                                @click="isActive.value = false"
                            >
                                CLOSE
                            </v-btn>
                        </v-toolbar>
                    </v-sheet>
                </local-scope>
            </template>
        </v-dialog>
        <v-row
            v-if="globalStatus != 'completed' && globalStatus != 'accepted'"
            :gap="[5, 10]"
        >
            <v-col
                class="w-100"
                cols="6"
            >
                <v-btn
                    v-if="globalStatus == 'refused'"
                    class="text-truncate"
                    block
                    disabled
                    @click.capture.stop
                >
                    Trade cancelled
                </v-btn>
                <v-btn
                    v-else-if="status.user == 'pending'"
                    block
                    color="success"
                    @click.capture.stop="accept(proposal.uid)"
                >
                    Accept
                </v-btn>
                <v-btn
                    v-else-if="status.opposite == 'pending'"
                    class="text-truncate"
                    block
                    disabled
                    @click.capture.stop
                >
                    Waiting response
                </v-btn>
                <v-btn
                    v-else
                    class="text-truncate"
                    block
                    disabled
                    @click.capture.stop
                >
                    ?????
                </v-btn>
            </v-col>
            <v-col
                class="w-100"
                cols="6"
            >
                <v-btn
                    v-if="globalStatus == 'refused'"
                    class="w-100"
                    block
                    color="primary"
                    @click.capture.stop="counter(proposal.uid)"
                >
                    Counter offer
                </v-btn>
                <v-btn
                    v-else-if="status.user == 'pending'"
                    class="w-100"
                    block
                    color="error"
                    @click.capture.stop="refuse(proposal.uid)"
                >
                    Refuse
                </v-btn>
                <v-btn
                    v-else-if="status.opposite == 'pending'"
                    class="w-100"
                    block
                    color="error"
                    @click.capture.stop="refuse(proposal.uid)"
                >
                    Cancel
                </v-btn>
                <v-btn
                    v-else
                    class="w-100"
                    block
                    disabled
                    @click.capture.stop="show"
                >
                    ?????
                </v-btn>
            </v-col>
        </v-row>
    </template>
</template>