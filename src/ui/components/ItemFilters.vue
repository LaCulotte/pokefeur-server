<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref, unref, watchEffect } from 'vue';
import type { Filters } from '../interfaces';
import PokemonFilter from './filters/PokemonFilter.vue';
import { getLangString, getPokemonName, getSetLangData } from '../controller/staticDataHelper';
import PokemonIcon from './PokemonIcon.vue';
import { removeAccents } from '../../common/utils';
import { Rarity, RarityRanks, Type } from '../../common/constants';
import Energy from './Energy.vue';
import RarityIcon from './RarityIcon.vue';
import SetFilter from './filters/SetFilter.vue';
import LocalScope from './LocalScope.vue';

const props = defineProps<{
    defaultFilters?: Partial<Filters>,
}>();

const emit = defineEmits<{
  update: [fullFilters: Filters, count: number]
}>();

const baseFilters = defineModel<Filters>('baseFilters', 
    { 
        default: {
            pokemon: new Set(),
            sets: new Set(),
            energyType: new Set(),
            rarity: new Set()
        } 
    });

const fullFilters = computed<Filters>(() => {
    return {
        itemTypes: props.defaultFilters?.itemTypes ?? baseFilters.value.itemTypes,
        itemId: props.defaultFilters?.itemId ?? baseFilters.value.itemId,
        name: props.defaultFilters?.name ?? baseFilters.value.name ?? '',
        
        pokemon: props.defaultFilters?.pokemon?.size ? props.defaultFilters?.pokemon : baseFilters.value.pokemon,
        sets: props.defaultFilters?.sets?.size ? props.defaultFilters?.sets : baseFilters.value.sets,
        energyType: props.defaultFilters?.energyType?.size ? props.defaultFilters?.energyType : baseFilters.value.energyType,
        rarity: props.defaultFilters?.rarity?.size ? props.defaultFilters?.rarity : baseFilters.value.rarity,
    };
});

const filtersCount = computed<number>(() => {
    let val = 0;

    val = 0;
    val += fullFilters.value.itemTypes ? 1 : 0;
    val += fullFilters.value.itemId ? 1 : 0;
    val += fullFilters.value.name ? 1 : 0;

    val += fullFilters.value.sets.size;
    if (fullFilters.value.itemTypes == 'card') {
        val += fullFilters.value.pokemon.size;
        val += fullFilters.value.energyType.size > 0 ? 1 : 0;
        val += fullFilters.value.rarity.size > 0 ? 1 : 0;
    }

    return val;
});

watchEffect(() => {
    emit("update", fullFilters.value, filtersCount.value);
});

const toggle = ref<number | undefined>(undefined);
    
const activeTab = computed(() => props.defaultFilters?.itemTypes ?? baseFilters.value.itemTypes ?? 'both');

watch(activeTab, (val) => {
    switch(val) {
    case 'card':
        toggle.value = 0;
        break;
    case 'booster':
        toggle.value = 1;
        break;
    case 'both':
        toggle.value = undefined;
        break;
    }
});

// TODO : check if it loops ??
watch(toggle, () => {
    if (toggle.value !== undefined) {
        const ret = toggle.value == 0 ? 'card' : 'booster';
        // activeTab.value = ret;
        baseFilters.value.itemTypes = ret;
    } else {
        // activeTab.value = 'both';
        baseFilters.value.itemTypes = undefined;
    }
});

function updateEnergies(val: unknown) {
    if (!!props.defaultFilters?.energyType?.size) {
        return;
    }
    
    baseFilters.value.energyType = new Set(val as Type[]);
}

function toggleAllEnergies() {
    if (fullFilters.value.energyType.size < Type.TYPE_COUNT) {
        updateEnergies(Array.from({ length: Type.TYPE_COUNT }, (v, i) => i));
    } else {
        updateEnergies([]);
    }
}

const rarityModel = computed(() => {
    const ret: number[] = [];

    for (const i of fullFilters.value.rarity) {
        const opt = RarityRanks.findIndex((rank) => rank.associatedRarities.includes(i));

        if (opt != -1 && !ret.includes(opt)) {
            ret.push(opt);
        }
    }

    return ret;
});

function updateRarities(val: unknown) {
    let ret: Rarity[] = [];
    for (const i of val as number[]) {
        ret = ret.concat(RarityRanks[i]!.associatedRarities);
    }

    baseFilters.value.rarity = new Set(ret);
}

function toggleAllRarities() {
    if (rarityModel.value.length < RarityRanks.length) {
        updateRarities(Array.from({ length: RarityRanks.length }, (v, i) => i));
    } else {
        updateRarities([]);
    }
}

function clear() {
    baseFilters.value = {
        itemTypes: undefined,
        name: '',
        pokemon: new Set(),
        sets: new Set(),
        energyType: new Set(),
        rarity: new Set(),
    };
}

function temp_replace(url: string): string {
    return url.replace("https://assets.tcgdex.net", `http://${window.location.hostname}:8000`);
}
</script>

<template>
    <v-dialog>
        <template v-slot:activator="activatorProps">
            <slot
                name="activator"
                v-bind="activatorProps"
                :clear="clear"
            />
        </template>
        <template v-slot="{ isActive: globalIsActive }">
            <v-card class="position-relative">
                <v-container fluid>
                    <v-text-field
                        variant="outlined"
                        label="Name"
                        clearable
                        v-model="baseFilters.name"
                    />

                    <div class="d-flex align-center justify-space-between">
                        <div class="my-2 text-h6 font-weight-bold">
                            Sets
                        </div>
                        <v-dialog
                            class="on-top"
                            :transition="false"
                        >
                            <template v-slot:activator="{ props: activatorProps }">
                                <v-btn
                                    icon
                                    density="compact"
                                    variant="text"
                                    :disabled="!!defaultFilters?.sets?.size"
                                    v-bind="activatorProps"
                                >
                                    <v-icon>mdi-plus</v-icon>
                                </v-btn>
                            </template>
                            <template v-slot="{ isActive }">
                                <v-sheet>
                                    <set-filter 
                                        :selected="fullFilters.sets"
                                        @select="(id: string) => { baseFilters.sets.add(id); isActive.value = false }"
                                    />
                                </v-sheet>
                            </template>
                        </v-dialog>
                    </div>
                    <v-sheet
                        v-for="(set, index) in fullFilters.sets"
                        :key="index"
                        class="d-flex align-center justify-space-between px-3 py-1 item-sheet"
                    >
                        <v-row
                            gap="12"
                            style="min-height: 30px;"
                        >
                            <local-scope 
                                :scope="{ setData: getSetLangData(set).value }"
                                v-slot="{ setData }"
                            >
                                <v-col
                                    class="center-content text-overflow"
                                >
                                    {{ setData.name }}
                                </v-col>
                                <v-col
                                    class="d-flex flex-align align-center justify-center"
                                    style="max-width: 40px;"
                                >
                                    <img
                                        v-if="setData.symbol"
                                        style="max-width: 20px; max-height: 20px;"
                                        :src="temp_replace(`${setData.symbol}.webp`)"
                                    >
                                </v-col>
                            </local-scope>
                            <v-divider vertical />
                            <v-col
                                cols="auto"
                                class="center-content"
                            >
                                <v-btn
                                    icon
                                    density="compact"
                                    size="small"
                                    variant="text"
                                    color="error"
                                    :disabled="!!defaultFilters?.sets?.size"
                                    @click="baseFilters.sets.delete(set)"
                                >
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-sheet>

                    <v-divider class="my-3" />

                    <v-btn-toggle
                        v-model="toggle"
                        color="primary"
                        class="w-100 d-flex"
                        :disabled="!!defaultFilters?.itemTypes"
                    >
                        <v-btn class="flex-1-1">
                            Pokemon
                        </v-btn>

                        <v-btn class="flex-1-1">
                            Booster
                        </v-btn>
                    </v-btn-toggle>

                    <v-tabs-window v-model="activeTab">
                        <v-tabs-window-item value="card">
                            <div class="d-flex align-center justify-space-between">
                                <div class="my-2 text-h6 font-weight-bold">
                                    Species
                                </div>

                                <v-dialog
                                    class="on-top"
                                    :transition="false"
                                >
                                    <template v-slot:activator="{ props: activatorProps }">
                                        <v-btn
                                            icon
                                            density="compact"
                                            variant="text"
                                            :disabled="!!defaultFilters?.pokemon?.size"
                                            v-bind="activatorProps"
                                        >
                                            <v-icon>mdi-plus</v-icon>
                                        </v-btn>
                                    </template>
                                    <template v-slot="{ isActive }">
                                        <v-sheet>
                                            <pokemon-filter 
                                                :selected="fullFilters.pokemon"
                                                @select="(id: number) => { baseFilters.pokemon.add(id); isActive.value = false }"
                                            />
                                        </v-sheet>
                                    </template>
                                </v-dialog>
                            </div>
                            <v-sheet
                                v-for="(pokemon, index) in fullFilters.pokemon"
                                :key="index"
                                class="d-flex align-center justify-space-between px-3 py-1 item-sheet"
                            >
                                <v-row
                                    gap="12"
                                    style="min-height: 30px;"
                                >
                                    <v-col
                                        cols="3"
                                        class="center-content"
                                    >
                                        #{{ pokemon }}
                                    </v-col>

                                    <v-col class="center-content">
                                        {{ getPokemonName(pokemon) }}
                                    </v-col>
                                    <v-col
                                        style="max-width: 40px;"
                                    >
                                        <pokemon-icon
                                            :id="pokemon"
                                        />
                                    </v-col>
                                    <v-divider vertical />
                                    <v-col
                                        cols="auto"
                                        class="center-content"
                                    >
                                        <v-btn
                                            icon
                                            density="compact"
                                            size="small"
                                            variant="text"
                                            color="error"
                                            :disabled="!!defaultFilters?.pokemon?.size"
                                            @click="baseFilters.pokemon.delete(pokemon)"
                                        >
                                            <v-icon>mdi-close</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-sheet>
                            <v-divider class="mt-3" />
                            <div class="d-flex align-center justify-space-between">
                                <div class="my-2 text-h6 font-weight-bold">
                                    Types
                                </div>
                                <v-btn
                                    class="h-auto py-1"
                                    rounded="xl"
                                    variant="outlined"
                                    active-color="primary"
                                    :active="fullFilters.energyType.size == Type.TYPE_COUNT"
                                    :disabled="!!defaultFilters?.energyType?.size"
                                    @click="toggleAllEnergies"
                                >
                                    ALL
                                </v-btn>
                            </div>
                            <v-btn-toggle
                                :model-value="Array.from(fullFilters.energyType.values())"
                                @update:model-value="updateEnergies"
                                style="height: unset !important"
                                class="w-100"
                                color="primary"
                                multiple
                            >
                                <v-row gap="2">
                                    <v-col
                                        v-for="t in Type.TYPE_COUNT"
                                        :key="t"
                                        class="d-flex justify-center"
                                        cols="3"
                                    >
                                        <v-btn
                                            rounded="xl"
                                            variant="outlined"
                                            :disabled="!!defaultFilters?.energyType?.size"
                                        >
                                            <energy
                                                :type="t - 1"
                                                :text-proportion="0"
                                            />
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-btn-toggle>
                            <v-divider class="mt-3" />
                            <div class="d-flex align-center justify-space-between">
                                <div class="my-2 text-h6 font-weight-bold">
                                    Rarity
                                </div>
                                <v-btn
                                    class="h-auto py-1"
                                    rounded="xl"
                                    variant="outlined"
                                    active-color="primary"
                                    :active="rarityModel.length == RarityRanks.length"
                                    :disabled="!!defaultFilters?.rarity?.size"
                                    @click="toggleAllRarities"
                                >
                                    ALL
                                </v-btn>
                            </div>
                            <v-btn-toggle
                                :model-value="rarityModel"
                                @update:model-value="updateRarities"
                                style="height: unset !important"
                                color="primary"
                                class="w-100"
                                multiple
                            >
                                <v-row gap="2">
                                    <v-col
                                        v-for="opt in RarityRanks"
                                        :key="opt.rank"
                                        class="d-flex justify-center"
                                        cols="3"
                                    >
                                        <v-btn
                                            rounded="xl"
                                            variant="outlined"
                                            :disabled="!!defaultFilters?.rarity?.size"
                                        >
                                            <rarity-icon
                                                style="height: 25px; width: 25px"
                                                :rarity="opt.rank"
                                            />
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-btn-toggle>
                        </v-tabs-window-item>

                        <v-tabs-window-item value="both" />
                        <v-tabs-window-item value="booster">
                            <v-container
                                fluid
                                class="py-2"
                            >
                                <div class="text-center">
                                    No booster filters yet
                                </div>
                            </v-container>
                        </v-tabs-window-item>
                    </v-tabs-window>
                    <div class="pa-3" />
                    <div class="w-100 d-flex justify-end">
                        <div
                            class="flex-grow-1 d-flex justify-start"
                        >
                            <v-btn
                                variant="text"
                                @click="clear"
                            >
                                CLEAR
                            </v-btn>
                        </div>
                        <v-btn
                            variant="text"
                            color="primary"
                            @click="globalIsActive.value = false"
                        >
                            OK
                        </v-btn>
                    </div>
                </v-container>
            </v-card>
        </template>
    </v-dialog>
</template>

<style scoped>
.tmp {
    background-color: red;

    min-height: 100vh;
}

.item-sheet {
    border: 1px solid rgba(0, 0, 0, 0.12);
}
.item-sheet + .item-sheet {
    border-top: none
}

.on-top > :deep(.v-overlay__content) {
    position: absolute;
    top: 0;
}

.center-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
}

/* :deep(.v-btn--disabled.v-btn--active) {
    opacity: 0.8;
} */
</style>