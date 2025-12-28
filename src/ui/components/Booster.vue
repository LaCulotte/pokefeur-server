<script setup lang="ts">
import type { BoosterItem } from '@/api/model/interfaces';
import { staticDataStore } from '../data/static/vueStaticData';
import { computed, type ComputedRef } from 'vue';
import { lang } from '../controller/lang';
import { user } from '../data/user/vueUserData';
import type { SetLangData } from '@/compiler/interfaces';

const props = defineProps<{
    item: BoosterItem
}>();

let unknownSet: ComputedRef<SetLangData> = computed(() => {
    return {
        lang: lang.value,
        id: "0",
        serieId: "0",
        name: `Weird Set`,
        releaseDate: "1970-01-01",
        releaseDateTs: 0,
        cardCount: {
            official: 0,
            total: 0
        },
        cards: {},
        logo: "",
        symbol: ""
    }
});

let itemStaticData = computed(() => {
        return staticDataStore[lang.value]?.sets[props.item.id] ?? unknownSet.value
    });

let logo = computed(() => {
        return itemStaticData.value.logo?.length > 0 
            ? itemStaticData.value.logo 
            : "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/MissingNo.svg/960px-MissingNo.svg.png";
    });

let name = computed(() => {
        return itemStaticData.value.name?.length > 0 ? itemStaticData.value.name : "No data";
    });

</script>

<template>
    <v-responsive class="w-100 h-100">
        <v-sheet class="position-absolute top-0 w-100 h-100 pa-1" elevation="4" border="opacity-50 xl" color="grey">
            <v-img class="w-100 h-100" style="overflow: visible;" :src="`${logo}.webp`">
            </v-img>
        </v-sheet>
        <v-btn class="pa-2 position-absolute" style="top: 75%; left: 50%; transform: translate(-50%, -50%);" @click="user.openBooster(item.uid)">Open</v-btn>
        <slot></slot>
    </v-responsive>
</template>