<script setup lang="ts">
import type { BoosterItem } from '@/api/data/interfaces';
import { staticDataStore } from '../data/static/vueStaticData';
import { computed } from 'vue';
import { lang } from '../controller/lang';

const props = defineProps<{
    item: BoosterItem
}>();

let itemStaticData = computed(() => {
        return staticDataStore[lang.value]?.sets[props.item.id]
    });
</script>

<template>
    booster : {{ item.id }} :  {{ itemStaticData?.name }}
    <img :src="`${itemStaticData?.logo}.webp`" style="width: 150px;"></img>
</template>