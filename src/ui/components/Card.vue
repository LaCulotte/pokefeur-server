<script setup lang="ts">
import type { CardItem } from '@/api/model/interfaces';
import { staticDataStore } from '../data/static/vueStaticData';
import { lang } from '../controller/lang';
import { computed, type ComputedRef } from 'vue';
import type { CardLangData } from '@/compiler/interfaces';
import { Category, Rarity } from '../../common/constants';
import { getCardLangData } from '../controller/staticDataHelper';

const props = defineProps<{
    cardId: string
}>();

let itemStaticData = computed(() => {
        return getCardLangData(props.cardId).value;
    });

let image = computed(() => {
        return itemStaticData.value.image?.length > 0 
            ? `${itemStaticData.value.image}/low.webp`
            : "/static/images/placeholders/missing_asset/card/low.webp";    // TODO : could make it depend on type of underlying card
    });

let name = computed(() => {
        return itemStaticData.value.name?.length > 0 ? itemStaticData.value.name : "No data";
    });


function temp_replace(url: string): string {
    return url.replace("https://assets.tcgdex.net", `http://${window.location.hostname}:8000`);
}

</script>

<template>
    <v-responsive class="w-100 h-100" style="aspect-ratio: 245/337;">
        <v-img class="position-absolute top-0 w-100 h-100" :src="temp_replace(image)" :title="name">
        </v-img>
        <slot></slot>
    </v-responsive>
</template>