<script setup lang="ts">
import type { CardItem } from '@/api/data/interfaces';
import { staticDataStore } from '../data/static/vueStaticData';
import { lang } from '../controller/lang';
import { computed } from 'vue';

const props = defineProps<{
    item: CardItem
}>();

let itemStaticData = computed(() => {
        return staticDataStore[lang.value]?.cards[props.item.id]
    });

// let itemStaticData = staticDataStore["fr"]?.cards[props.item.id];
</script>

<template>
    card : {{ item.id }}; {{ itemStaticData?.name }}
    <img :src="`${itemStaticData?.image}/low.webp`" style="width: 150px;"></img>
</template>