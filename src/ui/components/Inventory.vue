<script setup lang="ts">
import Item from './Item.vue';
import Energy from './Energy.vue';

import { computed, ref } from 'vue';
import { user } from '../data/user/vueUserData';
import { useDisplay } from 'vuetify'
import { Category, SUPPORTED_ENERGY_TYPES, Type } from '../../common/constants';
import type { CardItem } from '@/api/model/interfaces';

import { staticDataStore } from '../data/static/vueStaticData';
import { lang } from '../controller/lang';

const { xlAndUp, lgAndUp, smAndDown } = useDisplay()
const mainColsSize = computed(() => {
    return xlAndUp.value ? 2
        : lgAndUp.value ? 2
        : smAndDown.value ? 4
        : 3
})

const energyColsSize = computed(() => {
    return xlAndUp.value ? 2
        : lgAndUp.value ? 2
        : smAndDown.value ? 4
        : 3
})

function isCardRecyclable(card: CardItem) {
    const cardData = staticDataStore[lang.value]?.cards[card.id];

    if (cardData === undefined) {
        return false;
    }

    return [Category.POKEMON, Category.ENERGY].includes(cardData.category) && (cardData.types !== undefined);
}

</script>

<template>
    <div>
        <!-- Energies table -->
        <v-row class="w-100 ma-0" style="margin-bottom: 1vh !important">
            <v-col :cols="energyColsSize"
            v-for="energyType in SUPPORTED_ENERGY_TYPES"
            :key="energyType"
            class="d-flex justify-center align-center"
            >
                <energy :type="energyType">
                    {{ user.data.inventory.energies[energyType] ?? -1 }}
                </energy>
            </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row class="h-100 w-100 align-content-start ma-0" style="margin-top: 2vh !important">
            <v-col
            v-for="[i, obj] of Object.values(user.data.inventory.items).entries()"
            :cols="mainColsSize"
            class="w-100 d-flex justify-center align-center"
            style="max-height: 30%; padding: 4px;"
            :key="obj.uid"
            >
                <item :item="obj" :key="obj.uid">
                    <template v-slot:common-content="{ item }">
                        <v-btn
                        class="position-absolute close-btn-pos"
                        @click="user.removeItem(item.uid)"
                        color="error"
                        density="compact"
                        size="small"
                        :icon="`mdi-cross`"
                        >
                            x
                        </v-btn>
                    </template>

                    <template v-slot:booster-content="{ booster }">
                        <v-btn
                        class="pa-2 position-absolute"
                        style="top: 75%; left: 50%; transform: translate(-50%, -50%);"
                        @click="user.openBooster(booster.uid)">
                            Open
                        </v-btn>
                    </template>

                    <template v-slot:card-content="{ card }">
                        <v-btn
                        v-if="isCardRecyclable(card)"
                        class="pa-2 position-absolute"
                        style="top: 75%; left: 50%; transform: translate(-50%, -50%);"
                        @click="user.recycleCard(card.uid)">
                            Recycle
                        </v-btn>
                    </template>
                </item>
            </v-col>
        </v-row>
    </div>
</template>

<style lang="css">
/** Item aspect ratio is 245:337 */

.close-btn-pos {
    --pos: 2%;
    left: var(--pos);
    top: calc(var(--pos) * 245 / 337)
}
</style>