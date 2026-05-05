<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';

import BoosterComponentBase from './BoosterComponentBase.vue';
import { getSetLangData } from '../../controller/staticDataHelper';

const props = defineProps<{
    boosterId: string
}>();

const itemStaticData = computed(() => {
    return getSetLangData(props.boosterId).value;
});

const logo = computed(() => {
    return itemStaticData.value.logo?.length > 0
        ? `${itemStaticData.value.logo}.webp`
        : "/static/images/placeholders/missing_asset/logo.webp";
});

const name = computed(() => {
    return itemStaticData.value.name?.length > 0 ? itemStaticData.value.name : "No data";
});

function temp_replace(url: string): string {
    return url.replace("https://assets.tcgdex.net", `http://${window.location.hostname}:8000`);
}

</script>

<template>
    <booster-component-base
        :logo="temp_replace(logo)"
        :name="name"
    >
        <slot />
    </booster-component-base>
</template>