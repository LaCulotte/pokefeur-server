<script setup lang="ts">
import { user } from '../../data/user/vueUserData.ts';
import type { BoosterItem, CardItem, PublicUser, TradeProposalSide } from '../../../api/model/interfaces';
import type { CardStaticLangData, SetStaticLangData } from '../../../api/staticData/interfaces.js';
import { computed, type Ref, ref, watch } from 'vue';
import UserAvatar from '../users/UserAvatar.vue';
import { getCardLangData, getLangString, getSetLangData } from '../../controller/staticDataHelper.ts';
import CardComponentBase from '../item/CardComponentBase.vue';
import BoosterComponentBase from '../item/BoosterComponentBase.vue';
import RarityIcon from '../RarityIcon.vue';

const { side, edit = undefined } = defineProps<{
    side: TradeProposalSide,
    edit?: boolean
}>();

const emit = defineEmits<{
    removeItem: [string],
    addItems: []
}>();

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

// For now, todo : use 'computed' async
watch(() => side.uid, () => {
    fetchUser(side.uid).then((val) => sideUser.value = val);
});

function isCardWithData(itemData: ItemWithData): itemData is CardWithData {
    return itemData.item.type === 'card';
}

// type ItemWithData = {
//     item: CardItem,
//     cardData: Ref<CardStaticLangData>,
//     setData: Ref<SetStaticLangData>
// } | {
//     item: BoosterItem,
//     setData: Ref<SetStaticLangData>
// };

interface CardWithData {
    item: CardItem,
    cardData: Ref<CardStaticLangData>,
    setData: Ref<SetStaticLangData>
}

interface BoosterWithData {
    item: BoosterItem,
    setData: Ref<SetStaticLangData>
}

type ItemWithData = CardWithData | BoosterWithData;
type ItemWithDataT<T> = T extends 'card' ? CardWithData
                        : T extends 'booster' ? BoosterWithData
                        : never;

const items: Ref<ItemWithData[]> = computed(() => {
    const ret: ItemWithData[] = [];

    for (const item of side.items) {
        if (item.type == 'card') {
            const cardData = getCardLangData(item.id);
            
            ret.push({
                item,
                cardData,
                setData: getSetLangData(cardData.value.setId)
            });
        } else {
            ret.push({
                item,
                setData: getSetLangData(item.id)
            });
        }
    }

    return ret;
});
</script>

<template>
    <v-row :gap="[15, 10]">
        <v-col cols="auto">
            <user-avatar
                :username="sideUser?.username"
                :size="40"
            />
        </v-col>
        <v-col class="d-flex align-center text-body-large">
            {{ sideUser?.username }} {{ sideUser?.uid == user.data.uid ? '(you)' : '' }}
        </v-col>
    </v-row>
    <v-row
        :gap="[15, 0]"
        class="px-4"
    >
        <v-col class="d-flex align-center">
            <!-- <v-divider /> -->
        </v-col>
        <v-col cols="auto text-label-large">
            {{ side.items.length }} items
        </v-col>
        <v-col class="d-flex align-center">
            <!-- <v-divider /> -->
        </v-col>
    </v-row>
    <v-row
        v-if="items.length == 0"
        class="d-flex justify-center text-body-medium"
    >
        No item proposed
    </v-row>
    <v-row
        v-for="itemData of items"
        :key="itemData.item.uid"
        :gap="[15, 10]"
        class="border-sm rounded"
    >
        <template v-if="isCardWithData(itemData)">
            <v-col
                cols="3"
                class="d-flex justify-center border-e-sm"
            >
                <card-component-base
                    :image="`${itemData.cardData.value.image}/low.webp`"
                    :name="itemData.cardData.value.name"
                    style="max-width: 130px;"
                />
            </v-col>
            <v-col>
                <v-container class="d-flex flex-column justify-center h-100 py-0">
                    <v-row
                        class="text-body-medium flex-0-0"
                        gap="7"
                    >
                        Card - {{ itemData.cardData.value.name }}
                    </v-row>
                    <v-row
                        class="text-body-small flex-0-0"
                        gap="7"
                    >
                        From set - {{ itemData.setData.value.name }}
                    </v-row>

                    <v-row
                        class="text-body-medium flex-0-0"
                        gap="10"
                    >
                        <v-col
                            cols="1"
                            class="d-flex justify-center align-center h-100"
                        >
                            <rarity-icon
                                :rarity="itemData.cardData.value.rarity"
                                style="min-height: 10px; min-width: 10px;"
                            />
                        </v-col>
                        <v-col>
                            {{ getLangString('rarityNames', itemData.cardData.value.rarity) }}
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
        </template>
        <template v-else>
            <v-col
                cols="3"
                class="d-flex justify-center border-e-sm"
            >
                <booster-component-base
                    :logo="`${itemData.setData.value.logo}.webp`"
                    :name="itemData.setData.value.name"
                    style="max-width: 130px;"
                />
            </v-col>
            <v-col>
                <v-container class="d-flex flex-column justify-center h-100 py-0">
                    <v-row class="text-body-medium flex-0-0">
                        Booster - {{ itemData.setData.value.name }}
                    </v-row>
                </v-container>
            </v-col>
        </template>
        <v-col
            cols="auto"
            class="d-flex align-center border-s-sm"
            v-if="edit"
        >
            <v-btn
                variant="text"
                icon="mdi-close"
                color="red"
                @click="emit('removeItem', itemData.item.uid)"
            />
        </v-col>
    </v-row>
    <v-row
        v-if="edit"
        :gap="[15, 10]"
        @click="emit('addItems')"
    >
        <v-col
            cols="3"
            class="d-flex justify-center pa-1"
        >
            <div
                class="d-flex align-center justify-center w-100 h-100 rounded-md border-sm elevation-1"
                style="aspect-ratio: 245/337;"
            >
                <v-icon icon="mdi-plus" />
            </div>
        </v-col>
        <v-col>
            <v-container class="d-flex align-center text-body-medium h-100">
                Add item(s)
            </v-container>
        </v-col>
    </v-row>
</template>
