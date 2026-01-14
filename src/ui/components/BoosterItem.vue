<script setup lang="ts">
import type { BoosterItem } from '@/api/model/interfaces';
import { staticDataStore } from '../data/static/vueStaticData';
import { computed, type ComputedRef } from 'vue';
import { lang } from '../controller/lang';
import type { SetLangData } from '@/compiler/interfaces';

import BoosterBase from './BoosterBase.vue';

const props = defineProps<{
    item: BoosterItem,
    setData?: Partial<SetLangData>
}>();

let unknownSet: ComputedRef<SetLangData> = computed(() => {
    let defaultSet: SetLangData = {
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
    };
    
    return {
        ...defaultSet,
        ...props.setData ?? {}
    };
});

let itemStaticData = computed(() => {
        return staticDataStore[lang.value]?.sets[props.item.id] ?? unknownSet.value
    });

let logo = computed(() => {
        return itemStaticData.value.logo?.length > 0
            ? `${itemStaticData.value.logo}.webp`
            : "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/MissingNo.svg/960px-MissingNo.svg.png";
    });

let name = computed(() => {
        return itemStaticData.value.name?.length > 0 ? itemStaticData.value.name : "No data";
    });

function temp_replace(url: string): string {
    return url.replace("https://assets.tcgdex.net", "http://localhost:8000");
}

</script>

<template>
    <booster-base :logo="temp_replace(logo)" :name="name">
        <slot></slot>
    </booster-base>
</template>