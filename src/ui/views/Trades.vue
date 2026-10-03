<script setup lang="ts">
import type { TradeProposal } from '@/api/model/interfaces.js';
import TradeProposalPreview from '../components/trades/TradeProposalPreview.vue';
import { user } from '../data/user/vueUserData';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

function getSides(proposal: TradeProposal) {
    if (proposal.from.uid == user.data.uid) {
        return { user: proposal.from.accepted, opposite: proposal.to.accepted};
    } else if (proposal.to.uid == user.data.uid) {
        return { user: proposal.to.accepted, opposite: proposal.from.accepted};
    }
    
    return undefined;
}

// TODO : cleaner
function getProposalState(proposal: TradeProposal) {
    const sides = getSides(proposal);

    if (!sides) {
        return '';
    }

    if (sides.user == 'completed') {
        return 'completed';
    } else if (sides.user == 'refused' || sides.opposite == 'refused') {
        return 'completed';
    } else if (sides.user == 'pending' || sides.opposite == 'pending') {
        return 'pending';
    }

    return 'accepted';
}

const proposals = computed(() => {
    const ret = Object.values(user.data.trades.proposals);

    ret.sort((pa, pb) => {
        const aState = getProposalState(pa);
        const bState = getProposalState(pb);

        if (aState == bState) {
            return pb.proposalDate - pa.proposalDate;
        }

        if (aState == 'accepted') {
            return -1;
        } else if (bState == 'accepted') {
            return 1;
        }

        if (aState == 'pending') {
            return -1;
        } else if (bState == 'pending') {
            return 1;
        }

        return 0;
    });

    return ret;
});

function goToProposal(uid: string) {
    router.push({
        name: "view-trade-proposal",
        params: {
            "proposalUid": uid
        }
    });
}

function goToProposeTrade() {
    router.push({
        path: "/trade-user-search",
        query: {
            search: ""
        }
    });
}
</script>

<template>
    <v-container
        class="background"
        fluid
    >
        <trade-proposal-preview
            v-for="(proposal, i) of proposals"
            :key="i"
            :proposal="proposal"
            @click="goToProposal(proposal.uid)"
        />

        <div
            class="position-sticky d-flex w-100 justify-center left-0"
            style="bottom: calc(var(--btn-offset) * 2); margin-top: calc(var(--btn-offset) * 2);"
        >
            <v-btn
                color="primary"
                class="w-50"
                @click="goToProposeTrade"
            >
                Propose trade
            </v-btn>
        </div>
        <v-btn
            class="position-fixed d-flex" 
            style="bottom: var(--btn-offset); left: var(--btn-offset);"
            rounded="xl"
            icon="mdi-home"
            to="/"
        />
    </v-container>
</template>

<style>
</style>