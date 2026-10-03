<script setup lang="ts">
import TradeProposalDisplay from '../components/trades/TradeProposalDisplay.vue';

import { ref, watch, type Ref } from 'vue';

import type { PublicUser, TradeProposal } from '@/api/model/interfaces';
import { user } from '../data/user/vueUserData.ts';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps<{
    userUid: string
}>();

const otherUser: Ref<PublicUser | undefined> = ref(undefined);

const proposal = ref<TradeProposal>({
    from: {
        items: [],
        uid: user.data.uid,
        accepted: 'pending'
    },
    to: {
        items: [],
        uid: otherUser.value?.uid ?? '',
        accepted: 'pending'
    },
    uid: "",
    proposalDate: 0,
    acceptedDate: 0
});

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

if (typeof props.userUid == 'string') {
    fetchUser(props.userUid).then((val) => { otherUser.value = val; proposal.value.to.uid = val?.uid ?? ''; });
}

watch(user, () => {
    proposal.value.from.uid = user.data.uid;
});

async function createTradeProposal() {
    if (!otherUser.value) {
        console.log("No other user ?");
        return;
    }

    const offered = proposal.value.from.items.map(i => i.uid);
    const requested = proposal.value.to.items.map(i => i.uid);
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
            v-if="otherUser"
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
            No user of uid {{ otherUser }}
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