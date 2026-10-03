<script setup lang="ts">
import type { TradeProposal } from '@/api/model/interfaces';
import { user } from '../data/user/vueUserData.ts';
import { computed, ref, watch } from 'vue';
import TradeProposalDisplay from '../components/trades/TradeProposalDisplay.vue';
import TradeProposalDecision from '../components/trades/TradeProposalDecision.vue';

const props = defineProps<{
    proposalUid: string
}>();

// No edit
const proposal = computed(() => {
    return user.data.trades.proposals[props.proposalUid];
});

const status = computed(() => {
    if (!proposal.value)
        return;

    if (proposal.value.from.uid == user.data.uid) {
        return { user: proposal.value.from.accepted, opposite: proposal.value.to.accepted};
    } else if (proposal.value.to.uid == user.data.uid) {
        return { user: proposal.value.to.accepted, opposite: proposal.value.from.accepted};
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

// TODO : common function ?
const overlayColor = computed(() => {
    if (globalStatus.value == 'accepted') {
        return 'green';
    } else if (globalStatus.value == 'completed') {
        return 'black';
    } else if (globalStatus.value == 'refused') {
        return 'red';
    }

    return undefined;
});
</script>

<template>
    <div class="h-screen overflow-auto d-flex flex-column">
        <template
            v-if="proposal"
        >
            <trade-proposal-display
                v-model="proposal"
            >
                <template v-slot:header>
                    <v-sheet
                        class="sticky-header border-b-md flex-0-0"
                    >
                        <v-sheet
                            class="position-absolute h-100 w-100 top-0 left-0"
                            :color="overlayColor"
                            style="opacity: 0.2;"
                        />
                        <v-container class="d-flex justify-center text-body-large text-uppercase">
                            Trade
                        </v-container>
                        <div class="position-absolute top-0 left-0 h-100 d-flex align-center">
                            <v-btn
                                variant="text"
                                icon="mdi-arrow-left"
                                to="/trades"
                            />
                        </div>
                    </v-sheet>
                </template>
                <div class="position-sticky bottom-0 pa-2">
                    <v-sheet
                        class="border-sm pa-2"
                        rounded
                    >
                        <trade-proposal-decision
                            :proposal="proposal"
                        />
                    </v-sheet>
                </div>
            </trade-proposal-display>
        </template>
        <template v-else>
            No proposal of uid {{ proposalUid }}
        </template>
    </div>
</template>

<style scoped>
.sticky-header {
    position: sticky;
    top: 0;
    z-index: 20;
}
</style>