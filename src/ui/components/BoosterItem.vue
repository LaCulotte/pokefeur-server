<script setup lang="ts">
import type { BoosterItem } from '@/api/model/interfaces';
import { staticDataStore } from '../data/static/vueStaticData';
import { computed, type ComputedRef } from 'vue';
import { lang } from '../controller/lang';
import type { SetLangData } from '@/compiler/interfaces';

import BoosterBase from './BoosterBase.vue';
import { getSetLangData } from '../controller/staticDataHelper';

const props = defineProps<{
    boosterId: string
}>();

let itemStaticData = computed(() => {
    return getSetLangData(props.boosterId).value;
});

let logo = computed(() => {
    return itemStaticData.value.logo?.length > 0
        ? `${itemStaticData.value.logo}.webp`
        : "/static/images/placeholders/missing_asset/logo.webp";
});

let name = computed(() => {
    return itemStaticData.value.name?.length > 0 ? itemStaticData.value.name : "No data";
});

function temp_replace(url: string): string {
    return url.replace("https://assets.tcgdex.net", `http://${window.location.hostname}:8000`);
}

</script>

<template>
    <booster-base :logo="temp_replace(logo)" :name="name">
        <slot></slot>
    </booster-base>
</template>