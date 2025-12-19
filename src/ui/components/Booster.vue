<script setup lang="ts">
import type { BoosterItem } from '@/api/data/interfaces';
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
    <v-img class="h-100" :src="`${logo}.webp`">
        <div class="position-absolute top-0 d-flex justify-center align-center w-100 h-100">
            <v-btn class="ma-2 pa-2" @click="user.openBooster(item.uid)">Caca</v-btn>
        </div>
        <div class="position-absolute top-0 d-flex">
             <slot></slot>
        </div>
    </v-img>
</template>