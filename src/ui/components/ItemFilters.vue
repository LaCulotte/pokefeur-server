<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref, unref } from 'vue';
import type { Filters } from '../interfaces';
import PokemonFilter from './filters/PokemonFilter.vue';
import { getLangString, getPokemonName, getSetLangData } from '../controller/staticDataHelper';
import PokemonIcon from './PokemonIcon.vue';
import { removeAccents } from '../../common/utils';
import { Rarity, RarityRanks, Type } from '../../common/constants';
import Energy from './Energy.vue';
import RarityIcon from './RarityIcon.vue';
import SetFilter from './filters/SetFilter.vue';

const props = defineProps<{
    defaultFilters?: Partial<Filters>,
}>();

const model = defineModel<Filters>({ required: true });
const currVal = ref<Filters>({
    itemTypes: undefined,
    itemId: undefined,
    name: undefined,
    pokemon: new Set(),
    sets: new Set(),
    energyType: new Set(),
    rarity: new Set()
});

const showPokemon = computed(() => {
    return props.defaultFilters?.pokemon?.size ? props.defaultFilters.pokemon : currVal.value.pokemon;
});

const showSets = computed(() => {
    return props.defaultFilters?.sets?.size ? props.defaultFilters.sets : currVal.value.sets;
});


const toggle = ref<number | undefined>(undefined);
    
const activeTab = ref(props.defaultFilters?.itemTypes ?? currVal.value.itemTypes ?? 'both');
if (activeTab.value == 'card') {
    toggle.value = 0;
} else if (activeTab.value == 'booster') {
    toggle.value = 1;
}

watch(toggle, () => {
    if (toggle.value !== undefined) {
        const ret = toggle.value == 0 ? 'card' : 'booster';
        activeTab.value = ret;
        currVal.value.itemTypes = ret;
    } else {
        activeTab.value = 'both';
        currVal.value.itemTypes = undefined;
    }
});

const cardName = ref<string | undefined>(undefined);
watch(cardName, (val) => {
    currVal.value.name = val ? removeAccents(val) : undefined;
});

const energyModel = ref(Array.from(props.defaultFilters?.energyType?.values() ?? []));
watch(energyModel, () => {
    currVal.value.energyType = new Set(energyModel.value);
});

function toggleAllEnergies() {
    if (energyModel.value.length < Type.TYPE_COUNT) {
        energyModel.value = Array.from({ length: Type.TYPE_COUNT }, (v, i) => i);
    } else {
        energyModel.value = [];
    }
}

const rarityModel = ref<number[]>([]);

if (props.defaultFilters?.rarity) {
    for (const i of props.defaultFilters?.rarity) {
        const opt = RarityRanks.findIndex((opt) => opt.associatedRarities.includes(i));

        if (opt != -1 && !rarityModel.value.includes(opt)) {
            rarityModel.value.push(opt);
        }
    }
}

watch(rarityModel, () => {
    let ret: Rarity[] = [];
    for (const i of rarityModel.value) {
        ret = ret.concat(RarityRanks[i]!.associatedRarities);
    }

    currVal.value.rarity = new Set(ret);
});

function toggleAllRarities() {
    if (rarityModel.value.length < RarityRanks.length) {
        rarityModel.value = Array.from({ length: RarityRanks.length }, (v, i) => i);
    } else {
        rarityModel.value = [];
    }
}

function clear() {
    currVal.value = {
        itemTypes: undefined,
        name: '',
        pokemon: new Set(),
        sets: new Set(),
        energyType: new Set(),
        rarity: new Set(),
    };

    if (!props.defaultFilters?.itemTypes)
        toggle.value = undefined;

    if (!props.defaultFilters?.energyType)
        energyModel.value = [];
    
    if (!props.defaultFilters?.rarity)
        rarityModel.value = [];

    cardName.value = '';
}

function reset() {
    currVal.value = {
        itemTypes: model.value.itemTypes,
        itemId: model.value.itemId,
        name: model.value.name,
        pokemon: new Set(model.value.pokemon),
        sets: new Set(model.value.sets),
        energyType: new Set(model.value.energyType),
        rarity: new Set(model.value.rarity),
    };

    if (!props.defaultFilters?.itemTypes) {
        if (model.value.itemTypes == 'card') {
            toggle.value = 0;
            activeTab.value = 'card';
        } else if (model.value.itemTypes == 'booster') {
            toggle.value = 1;
            activeTab.value = 'booster';
        } else {
            toggle.value = undefined;
            activeTab.value = 'both';
        }
    }

    if (!props.defaultFilters?.rarity) {
        rarityModel.value = [];

        for (const i of model.value.rarity) {
            const opt = RarityRanks.findIndex((opt) => opt.associatedRarities.includes(i));

            if (opt != -1 && !rarityModel.value.includes(opt)) {
                rarityModel.value.push(opt);
            }
        }
    }

    if (!props.defaultFilters?.energyType) {
        energyModel.value = Array.from(model.value.energyType);
    }

    cardName.value = model.value.name;
}

function leave(isActive: Ref<boolean>) {
    reset();

    isActive.value = false;
}

function save(isActive: Ref<boolean>) {    
    model.value = {
        itemTypes: currVal.value.itemTypes,
        itemId: currVal.value.itemId,
        name: currVal.value.name,
        pokemon: new Set(currVal.value.pokemon),
        sets: new Set(currVal.value.sets),
        energyType: new Set(currVal.value.energyType),
        rarity: new Set(currVal.value.rarity),
    };
    
    isActive.value = false;
}

function temp_replace(url: string): string {
    return url.replace("https://assets.tcgdex.net", `http://${window.location.hostname}:8000`);
}
</script>

<template>
    <v-dialog
        class="on-top"
        persistent
    >
        <template v-slot:activator="activatorProps">
            <slot
                name="activator"
                v-bind="activatorProps"
            />
        </template>
        <template v-slot="{ isActive: globalIsActive }">
            <v-card class="position-relative">
                <v-container fluid>
                    <v-text-field
                        variant="outlined"
                        label="Name"
                        v-model="cardName"
                        clearable
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
                                        :selected="currVal.sets"
                                        @select="(id: string) => { currVal.sets.add(id); isActive.value = false }"
                                    />
                                </v-sheet>
                            </template>
                        </v-dialog>
                    </div>
                    <v-sheet
                        v-for="(set, index) in showSets"
                        :key="index"
                        class="d-flex align-center justify-space-between px-3 py-1 item-sheet"
                    >
                        <v-row
                            gap="12"
                            style="min-height: 30px;"
                        >
                            <!-- <v-col
                            cols="3"
                            class="center-content"
                        >
                            {{ set }}
                        </v-col> -->

                            <v-col
                                class="center-content text-overflow"
                            >
                                <!-- TODO : gets 3 times the set lang data !! -->
                                {{ getSetLangData(set).value.name }}
                            </v-col>
                            <v-col
                                class="d-flex flex-align align-center justify-center"
                                style="max-width: 40px;"
                            >
                                <img
                                    v-if="getSetLangData(set).value.symbol"
                                    style="max-width: 20px; max-height: 20px;"
                                    :src="temp_replace(`${getSetLangData(set).value.symbol}.webp`)"
                                >
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
                                    :disabled="!!defaultFilters?.sets?.size"
                                    @click="currVal.sets.delete(set)"
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
                                                :selected="currVal.pokemon"
                                                @select="(id: number) => { currVal.pokemon.add(id); isActive.value = false }"
                                            />
                                        </v-sheet>
                                    </template>
                                </v-dialog>
                            </div>
                            <v-sheet
                                v-for="(pokemon, index) in showPokemon"
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
                                            @click="currVal.pokemon.delete(pokemon)"
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
                                    :active="currVal.energyType.size == Type.TYPE_COUNT"
                                    :disabled="!!defaultFilters?.energyType?.size"
                                    @click="toggleAllEnergies"
                                >
                                    ALL
                                </v-btn>
                            </div>
                            <v-btn-toggle
                                v-model="energyModel"
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
                                v-model="rarityModel"
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
                            color="error"
                            @click="leave(globalIsActive)"
                        >
                            CANCEL
                        </v-btn>
                        <v-btn
                            variant="text"
                            color="primary"
                            @click="save(globalIsActive)"
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