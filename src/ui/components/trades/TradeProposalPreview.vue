<script setup lang="ts">
import { user } from '../../data/user/vueUserData.ts';
import type { PublicUser, TradeProposal } from '../../../api/model/interfaces';
import { computed, type Ref, ref } from 'vue';
import TradeProposalPreviewSide from './TradeProposalPreviewSide.vue';
import TradeProposalDecision from './TradeProposalDecision.vue';

const { proposal } = defineProps<{
    proposal: TradeProposal
}>();

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
    <v-container
        v-if="status != undefined"
        fluid
        class="rounded trade-container position-relative bg-surface"
    >
        <v-sheet
            v-if="globalStatus == 'accepted' || globalStatus == 'refused'"
            class="position-absolute h-100 w-100 top-0 left-0 rounded"
            :color="overlayColor"
            style="opacity: 0.2;"
        />
        <trade-proposal-preview-side
            :side="proposal.from"
        />
        <v-row :gap="[10, 10]">
            <v-col class="d-flex align-center">
                <v-divider />
            </v-col>
            <v-col cols="auto">
                <v-icon
                    icon="mdi-swap-vertical"
                    size="small"
                />
            </v-col>
            <v-col class="d-flex align-center">
                <v-divider />
            </v-col>
        </v-row>
        <trade-proposal-preview-side :side="proposal.to" />
        <v-row :gap="[5, 10]">
            <v-divider />
        </v-row>
        <trade-proposal-decision :proposal="proposal" />

        <v-row
            :gap="[10, 10]"
            class="justify-end text-body-small"
        >
            @ {{ new Date(proposal.proposalDate * 1000).toLocaleString() }}
        </v-row>
        <v-sheet
            v-if="globalStatus == 'completed'"
            class="position-absolute h-100 w-100 top-0 left-0 rounded"
            color="black"
            style="opacity: 0.2;"
        />
    </v-container>
</template>

<style scoped>
.trade-container + .trade-container {
    margin-top: 10px;
}

.wrap-btn .v-btn__content {
  white-space: normal;
  text-align: center;
}

.wrap-btn {
  height: auto !important;
  min-height: 36px;
}
</style>