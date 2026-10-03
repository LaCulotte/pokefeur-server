<script setup lang="ts">
import { user } from '../../data/user/vueUserData.ts';
import type { PublicUser, TradeProposal, TradeProposalSide } from '../../../api/model/interfaces';
import { type Ref, ref } from 'vue';
import UserAvatar from '../users/UserAvatar.vue';
import BaseItemComponent from '../item/BaseItemComponent.vue';
import ItemGrid from '../ItemGrid.vue';
import Badge from '../Badge.vue';

const { side, displayAll = undefined } = defineProps<{
    side: TradeProposalSide,
    displayAll?: boolean
}>();

// TODO : make it a common tool
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

// TODO : same here
const sideUser: Ref<PublicUser | undefined> = ref(undefined);
fetchUser(side.uid).then((val) => sideUser.value = val);

const numItemsDisplayed = ref(0);
</script>

<template>
    <v-row :gap="[15, 10]">
        <v-col cols="auto">
            <user-avatar
                :username="sideUser?.username"
                :size="32"
            />
        </v-col>
        <v-col class="d-flex align-center">
            {{ sideUser?.username }} {{ sideUser?.uid == user.data.uid ? '(you)' : '' }}
        </v-col>
    </v-row>
    <v-row :gap="[0, 10]">
        <v-col :cols="displayAll ? undefined : 11">
            <item-grid
                :item-count="side.items.length"
                :min-item-height-ratio="0.13"
                :max-item-height-ratio="0.2"
                :max-row="displayAll ? undefined : 1"
                v-model:num-items-displayed="numItemsDisplayed"
            >
                <template v-slot="{ i }">
                    <base-item-component
                        :item="side.items[i]!"
                    />
                </template>
            </item-grid>
        </v-col>
        <v-col
            v-if="!displayAll"
            cols="1"
            class="w-100 d-flex align-center justify-center"
        >
            <v-card
                v-if="numItemsDisplayed < side.items.length"
                class="d-flex align-center justify-center ma-0 overflow-visible elevation-0"
                color="transparent"
            >
                <v-icon
                    icon="mdi-plus"
                    size="x-large"
                />
                <badge
                    class="text-label-small"
                    style="top: -4px; right: -4px"
                >
                    {{ side.items.length - numItemsDisplayed < 10 ? (side.items.length - numItemsDisplayed) : '9+' }}
                </badge>
            </v-card>
        </v-col>
    </v-row>
</template>
