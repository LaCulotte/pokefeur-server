<script setup lang="ts">
import type { CardItem } from '@/api/model/interfaces';
import { staticDataStore } from '../data/static/vueStaticData';
import { lang } from '../controller/lang';
import { computed, type ComputedRef } from 'vue';
import type { CardLangData } from '@/compiler/interfaces';
import { Category, Rarity } from '../../common/constants';

const props = defineProps<{
    item: CardItem
}>();

let unknownCard: ComputedRef<CardLangData> = computed(() => {
    return {
        lang: lang.value,
        id: "0",
        name: "Weird Card",
        setId: "0",
        localId: "0",
        image: "",
        category: Category.UNDEFINED,
        rarity: Rarity.UNDEFINED
    }
});

let itemStaticData = computed(() => {
        return staticDataStore[lang.value]?.cards[props.item.id] ?? unknownCard.value
    });

let image = computed(() => {
        return itemStaticData.value.image?.length > 0 
            ? `${itemStaticData.value.image}/low.webp`
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
    <v-responsive class="w-100 h-100" style="aspect-ratio: 245/337;">
        <v-img class="position-absolute top-0 w-100 h-100" :src="temp_replace(image)" :title="name">
        </v-img>
        <slot></slot>
    </v-responsive>
</template>