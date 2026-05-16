<script setup lang="ts" generic="T extends Booster">
import BaseItemDisplay from './BaseItemDisplay.vue';
import type { Booster } from '@/api/model/interfaces';
import CardComponent from './CardComponent.vue';
import { getSetLangData } from '../../controller/staticDataHelper';

const { booster } = defineProps<{
    booster: T
}>();

const setLangData = getSetLangData(booster.id);

function temp_replace(url: string): string {
    return url.replace("https://assets.tcgdex.net", `http://${window.location.hostname}:8000`);
}
</script>

<template>
    <base-item-display
        :base="booster"
    >
        <template v-slot:legend>
            <v-row
                class="w-100 justify-center"
                gap="5"
            >
                <!-- <v-col> -->
                <div class="text-medium-emphasis text-body-medium text-center text-no-wrap">
                    {{ setLangData.id }}
                </div>
                <!-- </v-col>
                <v-col
                    v-if="setLangData.symbol"
                    cols="2"
                > -->
                <img
                    v-if="setLangData.symbol"
                    style="max-width: 20px"
                    :src="temp_replace(`${setLangData.symbol}.webp`)"
                >
                <!-- </v-col> -->
            </v-row>
        </template>
        <template v-slot:description-short> 
            <div class="text-center">
                <div
                    class="text-medium-emphasis text-body-medium d-flex justify-space-around"
                >
                    Booster
                </div>
                <div class="text-title-medium">
                    {{ setLangData.name }} 
                </div>
            </div>
            <v-divider />
            <v-row
                style="min-height: 25px; align-items: stretch"
                gap="0"
            >
                <v-col
                    class="d-flex align-center text-body-medium"
                >
                    Card count
                </v-col>
                <v-col
                    class="d-flex align-center text-body-medium"
                    cols="3"
                >
                    {{ setLangData.cardCount.official }}
                </v-col>
            </v-row>
            <v-row
                style="min-height: 25px; align-items: stretch"
                gap="0"
            >
                <v-col
                    class="d-flex align-center text-body-medium"
                >
                    True # of cards
                </v-col>
                <v-col
                    class="d-flex align-center text-body-medium"
                    cols="3"
                >
                    {{ setLangData.cardCount.total }}
                </v-col>
            </v-row>
        </template>
    </base-item-display>
</template>