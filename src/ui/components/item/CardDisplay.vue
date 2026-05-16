<script setup lang="ts" generic="T extends Card">
import { Category, Rarity } from '../../../common/constants';
import { getCardLangData, getSetLangData, getPokemonName, getLangString } from '../../controller/staticDataHelper';
import Energy from '../Energy.vue';
import PokemonIcon from '../PokemonIcon.vue';
import RarityIcon from '../RarityIcon.vue';
import BaseItemDisplay from './BaseItemDisplay.vue';

import type { Card } from '@/api/model/interfaces';

const { card } = defineProps<{
    card: T
}>();

const cardLangData = getCardLangData(card.id);
const setLangData = getSetLangData(cardLangData.value.setId);

const typeWithIslast = cardLangData.value.types?.map((type, index) => ({
    type,
    isLast: index === (cardLangData.value.types?.length ?? 0) - 1
}));

function temp_replace(url: string): string {
    return url.replace("https://assets.tcgdex.net", `http://${window.location.hostname}:8000`);
}
</script>

<template>
    <base-item-display
        :base="card"
    >
        <template v-slot:legend>
            <div class="text-medium-emphasis text-body-medium text-center text-no-wrap">
                {{ cardLangData.localId }}/{{ setLangData.cardCount.official }} - {{ setLangData.id }}
            </div>
        </template>
        <template v-slot:description-short>
            <div class="text-center">
                <div class="text-title-medium">
                    {{ cardLangData.name }} 
                </div>
                <div
                    class="text-medium-emphasis text-body-medium d-flex justify-space-around"
                >
                    <div>{{ setLangData.name }}</div>
                    <!-- <img
                        style="max-width: 20px"
                        :src="temp_replace(`${setLangData.symbol}.webp`)"
                    > -->
                </div>
            </div>
            <v-divider />
            <!-- <div>{{ cardLangData.category }}</div> -->
            <!-- <div>{{ setLangData.name }}</div> -->
            <!-- <div>{{ cardLangData.rarity }}</div> -->
            <!-- <div>{{ cardLangData.dexId }}</div> -->
            <v-row
                v-for="dexId in cardLangData.dexId"
                :key="dexId"
                style="min-height: 25px; align-items: stretch"
                gap="0"
            >
                <v-col
                    class="d-flex align-center text-body-medium"
                >
                    {{ getPokemonName(dexId) }} (#{{ dexId }})
                </v-col>
                <v-col
                    cols="3"
                >
                    <pokemon-icon :id="dexId" />
                </v-col>
            </v-row>
            <v-row
                v-if="typeWithIslast"
                gap="0"
                style="min-height: 25px; align-items: stretch"
            >
                <v-col class="d-flex align-center text-body-medium">
                    <span
                        v-for="{ type, isLast } in typeWithIslast"
                        :key="type"
                    >
                        {{ getLangString('typeNames', type) }}
                        <span v-if="!isLast"> / </span>
                    </span>
                </v-col>
                <v-col
                    cols="3"
                    class="d-flex justify-center"
                >
                    <template
                        v-for="{ type, isLast } in typeWithIslast"
                        :key="type"
                    >
                        <energy
                            :type="type"
                            :text-proportion="0"
                            :height="20"
                        />
                        <span v-if="!isLast"> / </span>
                    </template>
                </v-col>
            </v-row>
            <v-row
                v-if="cardLangData.category == Category.ENERGY || (cardLangData.category == Category.TRAINER && cardLangData.trainerType === undefined)"
                style="min-height: 25px; align-items: stretch"
            >
                <v-col class="d-flex align-center text-body-medium">
                    {{ getLangString("categoryNames", cardLangData.category) }}
                </v-col>
            </v-row>
            <v-row
                v-if="cardLangData.trainerType !== undefined"
                style="min-height: 25px; align-items: stretch"
            >
                <v-col class="d-flex align-center text-body-medium">
                    {{ getLangString("trainerTypeNames", cardLangData.trainerType) }}
                </v-col>
            </v-row>
            <v-row
                v-if="cardLangData.rarity != Rarity.NONE"
                gap="0"
                style="min-height: 25px; align-items: stretch"
            >
                <v-col class="d-flex align-center text-body-medium">
                    {{ getLangString('rarityNames', cardLangData.rarity) }}
                </v-col>
                <v-col
                    cols="3"
                    class="d-flex justify-center align-center"
                >
                    <rarity-icon
                        :rarity="cardLangData.rarity"
                        style="height: 20px;"
                    />
                </v-col>
            </v-row>
        </template>

        <template v-slot:description-bottom>
            <div
                v-if="cardLangData.description"
                class="w-100 text-body-medium"
            >
                {{ cardLangData.description ?? 'No description' }}
            </div>
        </template>
    </base-item-display>
</template>