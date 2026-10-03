<script setup lang="ts">
import TradeProposalDisplay from '../components/trades/TradeProposalDisplay.vue';

import { ref, watch, type Ref } from 'vue';

import type { PublicUser, TradeProposal } from '@/api/model/interfaces';
import { user } from '../data/user/vueUserData.ts';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps<{
    proposalUid: string
}>();


const proposal = ref<TradeProposal | undefined>();

async function fetchUser(userUid: string) : Promise<PublicUser | undefined> {
    if (userUid == user.data.uid) {
        return user.data;
    }

    const response = await fetch("/api/getPublicUser?" + new URLSearchParams({ userUid: userUid }).toString());

    if (!response.ok) {
        return;
    }

    const data = await response.json();
    return data.user;
};

function filterProposalFromInventory(user: PublicUser) {
    if (!proposal.value) {
        return;
    }
    
    const side = user.uid == proposal.value.from.uid ? proposal.value.from : proposal.value.to;

    side.items = side.items.filter((i) => i.uid in user.inventory.items);
}

function duplicateProposal(newProposal?: TradeProposal) : TradeProposal | undefined {
    if (!newProposal){
        return;
    }
    
    return {
        ...newProposal,
        from: {
            ...newProposal.from,
            items: [...newProposal.from.items]
        },
        to: {
            ...newProposal.to,
            items: [...newProposal.to.items]
        }
    };
}

let otherUserUid: string | undefined = undefined;
const otherUser: Ref<PublicUser | undefined> = ref(undefined);

if (user.data) {
    proposal.value = duplicateProposal(user.data.trades.proposals[props.proposalUid]);
    filterProposalFromInventory(user.data);

    otherUserUid = proposal.value?.from.uid == user.data.uid ? proposal.value?.to.uid : proposal.value?.from.uid;
    if (typeof otherUserUid == 'string') {
        fetchUser(otherUserUid).then((val) => { 
            if (val) {
                otherUser.value = val; 
                filterProposalFromInventory(val);
            }
        });
    }
}


watch(user, () => {
    if (proposal.value) {
        return;
    }

    // proposal.value = user.data.trades.proposals[props.proposalUid];
    proposal.value = duplicateProposal(user.data.trades.proposals[props.proposalUid]);
    filterProposalFromInventory(user.data);

    if (otherUser.value) {
        filterProposalFromInventory(otherUser.value);
    } else if (otherUserUid == undefined) {
        otherUserUid = proposal.value?.from.uid == user.data.uid ? proposal.value?.to.uid : proposal.value?.from.uid;
        if (typeof otherUserUid == 'string') {
            fetchUser(otherUserUid).then((val) => { 
                if (val) {
                    otherUser.value = val; 
                    filterProposalFromInventory(val);
                }
            });
        }
    }
});

async function createTradeProposal() {
    console.log(otherUser.value, proposal.value);
    if (!otherUser.value || !proposal.value) {
        console.log("No other user or no proposal ?");
        return;
    }

    const fromItems = proposal.value.from.items.map(i => i.uid);
    const toItems = proposal.value.to.items.map(i => i.uid);

    const [offered, requested] = user.data.uid == proposal.value.from.uid ? [fromItems, toItems] : [toItems, fromItems];
    
    const ret = await user.createTradeProposal(otherUser.value.uid, offered, requested);
    if (!ret.has_value) {
        console.error(ret.error());
    } else {
        router.push("/trades");
    }
}
</script>

<template>
    <div class="h-screen overflow-auto d-flex flex-column">
        <template
            v-if="proposal"
        >
            <trade-proposal-display
                v-model="proposal"
                edit
            >
                <template v-slot:header>
                    <v-sheet
                        class="sticky-header border-b-md flex-0-0"
                    >
                        <v-sheet
                            class="position-absolute h-100 w-100 top-0 left-0"
                            style="opacity: 0.2;"
                        />
                        <v-container class="d-flex justify-center text-body-large text-uppercase">
                            Make trade proposal
                        </v-container>
                        <div class="position-absolute top-0 left-0 h-100 d-flex align-center">
                            <v-btn
                                variant="text"
                                icon="mdi-arrow-left"
                                @click="router.back()"
                            />
                        </div>
                    </v-sheet>
                </template>
                <div class="position-sticky bottom-0 pa-2">
                    <v-sheet
                        class="border-sm pa-2"
                        rounded
                    >
                        <v-btn
                            color="success"
                            class="w-100"
                            :disabled="proposal.from.items.length + proposal.to.items.length == 0"
                            @click="createTradeProposal"
                        >
                            Send proposal
                        </v-btn>
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