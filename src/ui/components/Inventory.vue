<script setup lang="ts">
import ItemGrid from './ItemGrid.vue';
import Energy from './Energy.vue';

import { computed, ref, onMounted } from 'vue';
import { user } from '../data/user/vueUserData';
import { useDisplay } from 'vuetify'
import { Category, SUPPORTED_ENERGY_TYPES, Type } from '../../common/constants';
import type { CardItem } from '@/api/model/interfaces';

import { staticDataStore } from '../data/static/vueStaticData';
import { lang } from '../controller/lang';
import TempPadding from './TempPadding.vue';

const props = defineProps<{
    maxItemHeight?: string,
    scrollElem?: HTMLDivElement | null,
}>();

const emit = defineEmits<{
    removeItem: []
}>();

const { xlAndUp, lgAndUp, smAndDown } = useDisplay()

const energyColsSize = computed(() => {
    return xlAndUp.value ? 2
        : lgAndUp.value ? 2
        : smAndDown.value ? 4
        : 3
});

// TODO : make this function common
function isCardRecyclable(card: CardItem) {
    const cardData = staticDataStore[lang.value]?.cards[card.id];

    if (cardData === undefined) {
        return false;
    }

    if(![Category.POKEMON, Category.ENERGY].includes(cardData.category) || (cardData.types === undefined)) {
        return false;
    }

    for (let type of cardData.types) {
        if (!SUPPORTED_ENERGY_TYPES.includes(type)) {
            return false;
        }
    }

    return true;
}

function removeItem(uid: string) {
    user.removeItem(uid);
    emit("removeItem");
}

onMounted(() => {
    console.log("---")
    console.log(props.scrollElem);
    console.log("---")
})

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
        <item-grid
        :items="Object.values(user.data.inventory.items)"
        :max-item-height-ratio="0.25"
        :min-item-height-ratio="0.25"
        :scroll-elem="scrollElem"
        class="mt-2"
        >
            <template v-slot:common-content="{ item }">
                <v-btn
                class="position-absolute close-btn-pos"
                @click="removeItem(item.uid)"
                color="error"
                density="compact"
                size="small"
                :icon="`mdi-cross`"
                >
                    x
                </v-btn>

                <div
                :id="`${item.uid}-overlay`"
                class="position-absolute top-0 h-100 w-100"
                style="pointer-events: none"
                >
                </div>
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

            <template v-slot:after-grid>
                <slot></slot>
            </template>
        </item-grid>
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

<style>
.border-smooth {
    border: solid 3px red;
    transition: border 500ms ease;
    will-change: boder;
}
.border-smooth.border-hide {
    border: solid 3px rgba(0,0,0,0);
}
</style>