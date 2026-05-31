<script setup lang="ts" generic="T extends InventoryItem">
import ItemGrid from './ItemGrid.vue';
import ItemFilters from './ItemFilters.vue';
import BaseItemComponent from './item/BaseItemComponent.vue';

import { ref, type Ref, watch, computed, withModifiers } from 'vue';
import type { Card, Booster, InventoryItem, CardItem, BoosterItem } from '@/api/model/interfaces';
import type { GroupedItems, GroupedCards, GroupedBoosters } from '@/ui/interfaces';
import LocalScope from './LocalScope.vue';

import GroupedItemsComponent from './GroupedItemsComponent.vue';
import type { Filters } from '../interfaces';
import { getCardLangData, getSetLangData } from '../controller/staticDataHelper';
import type { CardStaticLangData, SetStaticLangData } from '../../api/staticData/interfaces';
import { removeAccents } from '../../common/utils';
import { Category, Rarity, RarityRanks } from '../../common/constants.ts';

defineEmits(['item-click']);

const props = defineProps<{
    scrollElem?: HTMLDivElement | null,
    items: T[],
    focusItemUid?: string,
    dialogAnchor?: string,
    defaultFilters?: Partial<Filters>
}>();

const isActive = defineModel<boolean>('dialogActive', { default: false });

const filters: Ref<Filters> = ref({
    pokemon: new Set(),
    sets: new Set(),
    energyType: new Set(),
    rarity: new Set()
});

const mergedFilters = computed<Filters>(() => {
    return {
        itemTypes: props.defaultFilters?.itemTypes ?? filters.value.itemTypes,
        itemId: props.defaultFilters?.itemId ?? filters.value.itemId,
        name: props.defaultFilters?.name ?? filters.value.name,

        pokemon: props.defaultFilters?.pokemon?.size ? props.defaultFilters?.pokemon : filters.value.pokemon,
        sets: props.defaultFilters?.sets?.size ? props.defaultFilters?.sets : filters.value.sets,
        energyType: props.defaultFilters?.energyType?.size ? props.defaultFilters?.energyType : filters.value.energyType,
        rarity: props.defaultFilters?.rarity?.size ? props.defaultFilters?.rarity : filters.value.rarity,
    };
});

function checkPokemon(data: CardStaticLangData) {
    if (!data.dexId)
        return false;
    
    for (const id of data.dexId) {
        if ((mergedFilters.value.pokemon).has(id)) {
            return true;
        }
    }

    return false;
}

function checkType(data: CardStaticLangData) {
    if (!data.types)
        return false;
    
    for (const type of data.types) {
        if ((mergedFilters.value.energyType).has(type)) {
            return true;
        }
    }

    return false;
}

function checkRarity(data: CardStaticLangData) {
    return (mergedFilters.value.rarity).has(data.rarity);
}

function checkName(data: SetStaticLangData | CardStaticLangData) {
    return removeAccents(data.name).includes(mergedFilters.value.name ?? '');
}

function checkItem(data: SetStaticLangData | CardStaticLangData) {
    return (mergedFilters.value.itemId) == data.id;
}

function checkCardSet(data: CardStaticLangData) {
    return (mergedFilters.value.sets).has(data.setId);
}

function checkBoosterSet(data: SetStaticLangData) {
    return (mergedFilters.value.sets).has(data.id);
}

// To be sorted ?
const filteredItems = computed(() => {
    let ret = props.items;

    const cardFilters: ((data: CardStaticLangData) => boolean)[] = [];
    const boosterFilters: ((data: SetStaticLangData) => boolean)[] = [];
    const bothFilters: ((data: SetStaticLangData | CardStaticLangData) => boolean)[] = [];

    if ((mergedFilters.value.itemTypes) == 'booster') {
        ret = ret.filter((item) => item.type == 'booster');

    } else if ((mergedFilters.value.itemTypes) == 'card') {
        ret = ret.filter((item) => item.type == 'card');

        if (mergedFilters.value.pokemon.size > 0) {
            cardFilters.push(checkPokemon);
        }

        if (mergedFilters.value.energyType.size > 0) {
            cardFilters.push(checkType);
        }

        if (mergedFilters.value.rarity.size > 0) {
            cardFilters.push(checkRarity);
        }
    }

    if (mergedFilters.value.sets.size > 0) {
        cardFilters.push(checkCardSet);
        boosterFilters.push(checkBoosterSet);
    }


    if (mergedFilters.value.name?.length) {
        bothFilters.push(checkName);
    }

    if (mergedFilters.value.itemId?.length) {
        bothFilters.push(checkItem);
    }

    ret = ret.filter((item) => {
        if (item.type === 'card') {
            const data = getCardLangData(item.id).value;

            for (const filter of cardFilters) {
                if (!filter(data)) {
                    return false;
                }
            }
            for (const filter of bothFilters) {
                if (!filter(data)) {
                    return false;
                }
            }

            return true;
        } else {
            const data = getSetLangData(item.id).value;

            for (const filter of boosterFilters) {
                if (!filter(data)) {
                    return false;
                }
            }
            for (const filter of bothFilters) {
                if (!filter(data)) {
                    return false;
                }
            }

            return true;
        }
    });

    return ret;
});

const filterCount = computed(() => {
    let count = 0;

    const val = mergedFilters.value;

    count += val.itemTypes ? 1 : 0;
    count += val.itemId ? 1 : 0;
    count += val.name ? 1 : 0;

    count += val.sets.size;
    if (val.itemTypes == 'card') {
        count += val.pokemon.size;
        count += val.energyType.size > 0 ? 1 : 0;
        count += val.rarity.size > 0 ? 1 : 0;
    }

    return count;
});

// Regroup the items per type & id
const itemsGroups: Ref<Record<string, GroupedItems<T>>> = computed(() => {
    const ret: Record<string, GroupedItems<T>> = {};

    const tempItems = [...filteredItems.value];
    if (sortBy.value.by == SortMethod.OPTENTION_DATE && !asc.value) {
        tempItems.reverse();
    }

    for (const item of tempItems) {
        if (item.type === 'card') {
            let group: GroupedCards<T> | undefined = ret[item.id] as GroupedCards<T>;
            
            if (group === undefined) {
                const { uid, ...base } = item;

                group = {
                    base: base as Omit<T, 'uid'> & Card,
                    items: []
                };
                ret[item.id] = group;

                // ret.push(groupedCards[item.id]!);
            }

            group.items.push(item as T & CardItem);
        } else if (item.type === 'booster') {
            let group: GroupedBoosters<T> | undefined = ret[item.id] as GroupedBoosters<T>;

            if (group === undefined) {
                const { uid, ...base } = item;

                group = {
                    base: base as Omit<T, 'uid'> & Booster,
                    items: []
                };
                ret[item.id] = group;

                // ret.push(groupedBoosters[item.id]!);
            }

            group.items.push(item as T & BoosterItem);
        }
    }

    return ret;
});

const rarityRankMap: Partial<Record<Rarity, number>> = {};
RarityRanks.map((rank, i) => {
    for (const rarity of rank.associatedRarities)
        rarityRankMap[rarity] = i;
});

enum SortMethod {
    OPTENTION_DATE,
    COUNT,
    SET,
    RARITY,
    SPECIES,
    TYPE,
}

const sortByOptions = [
    {
        title: "Optention date",
        by: SortMethod.OPTENTION_DATE,
        props: { appendIcon: "mdi-update" },
    },
    {
        title: "Count",
        by: SortMethod.COUNT,
        props: { appendIcon: "mdi-pound" },
    },
    {
        title: "Set",
        by: SortMethod.SET,
        props: { appendIcon: "mdi-cards-outline" },
    },
    {
        title: "Species",
        by: SortMethod.SPECIES,
        props: { appendIcon: "mdi-pokeball" },
    },
    {
        title: "Type",
        by: SortMethod.TYPE,
        props: { appendIcon: "mdi-hexagram" },
    },
    // TODO : use rarity order from itemsFilter
    {
        title: "Rarity",
        by: SortMethod.RARITY,
        props: { appendIcon: "mdi-creation" },
    },
];

const sortBy = ref(sortByOptions[0]!);
const asc = ref<boolean>(false);
const menuSortByActive = ref<boolean>(false);

function selectSortBy(val: unknown, isActive: Ref<boolean>) {
    sortBy.value = val as typeof sortBy.value;
    // isActive.value = false;
}

function getSet(group: GroupedItems<T>) {
    if (group.base.type == 'booster') {
        return getSetLangData(group.base.id);
    } else {
        const cardData = getCardLangData(group.base.id);
        return getSetLangData(cardData.value.setId);
    }
}

// To be sorted ?
// const itemsGroupsList = computed(() => Object.values(itemsGroups.value));
const itemsGroupsList = computed(() => {
    const ret = Object.values(itemsGroups.value);

    const by = sortBy.value.by;
    const sortRet = asc.value ? 1 : -1;

    // if (by == SortMethod.OPTENTION_DATE && !asc.value) {
    //     ret.reverse();
    // } else if (by == SortMethod.COUNT) {
    if (by == SortMethod.COUNT) {
        ret.sort((grpA, grpB) => grpA.items.length > grpB.items.length ? sortRet : -sortRet);
    } else if (by == SortMethod.SET) {
        ret.sort((grpA, grpB) => {
            const aSet = getSet(grpA);
            const bSet = getSet(grpB);

            if (aSet.value.id == bSet.value.id) {
                if (grpB.base.type == 'booster') {
                    return -1;
                } else if (grpA.base.type == 'booster') {
                    return 1;
                } else {
                    const aCard = getCardLangData(grpA.base.id);
                    const bCard = getCardLangData(grpB.base.id);
                    return parseInt(aCard.value.localId) > parseInt(bCard.value.localId) ? 1 : -1;
                }
            }

            return aSet.value.releaseDateTs > bSet.value.releaseDateTs ? sortRet : -sortRet;
        });
    } else if (by == SortMethod.SPECIES) {
        ret.sort((grpA, grpB) => {
            if (grpB.base.type == 'booster') {
                return sortRet;
            } else if (grpA.base.type == 'booster') {
                return -sortRet;
            }

            const aCard = getCardLangData(grpA.base.id);
            const bCard = getCardLangData(grpB.base.id);

            if (bCard.value.category != Category.POKEMON) {
                return sortRet;
            } else if (aCard.value.category != Category.POKEMON) {
                return -sortRet;
            }

            if (!bCard.value.dexId?.length) {
                return sortRet;
            } else if (!aCard.value.dexId?.length) {
                return -sortRet;
            }

            return aCard.value.dexId[0]! > bCard.value.dexId[0]! ? -sortRet : sortRet;
        });
    } else if (by == SortMethod.TYPE) {
        ret.sort((grpA, grpB) => {
            if (grpB.base.type == 'booster') {
                return -1;
            } else if (grpA.base.type == 'booster') {
                return 1;
            }

            const aCard = getCardLangData(grpA.base.id);
            const bCard = getCardLangData(grpB.base.id);

            if (bCard.value.category != Category.POKEMON) {
                if (aCard.value.category == Category.POKEMON) {
                    return -1;
                }

                return aCard.value.category > bCard.value.category ? -sortRet : sortRet;

            } else if (aCard.value.category != Category.POKEMON) {
                return 1;
            }

            if (!bCard.value.types?.length) {
                return -1;
            } else if (!aCard.value.types?.length) {
                return 1;
            }

            return aCard.value.types[0]! > bCard.value.types[0]! ? -sortRet : sortRet;
        });
    } else if (by == SortMethod.RARITY) {
        ret.sort((grpA, grpB) => {
            if (grpB.base.type == 'booster') {
                return -1;
            } else if (grpA.base.type == 'booster') {
                return 1;
            }

            const aCard = getCardLangData(grpA.base.id);
            const bCard = getCardLangData(grpB.base.id);

            const aRarity = rarityRankMap[aCard.value.rarity];
            const bRarity = rarityRankMap[bCard.value.rarity];

            if (bRarity == undefined) {
                return -1;
            } else if (aRarity == undefined) {
                return 1;
            }

            return aRarity > bRarity ? -sortRet : sortRet;
        });
    }
    return ret;
});

// const focusItemIndex: Ref<number | undefined> = ref(undefined);
const globalFocusItemIndex: Ref<number | undefined> = ref(undefined);
const localFocusItemIndex: Ref<number | undefined> = ref(undefined);
const focusItemId: Ref<string | undefined> = ref(undefined);
watch(() => props.focusItemUid, () => {
    if (props.focusItemUid === undefined) {
        // focusItemIndex.value = undefined;
        globalFocusItemIndex.value = undefined;
        localFocusItemIndex.value = undefined;
        focusItemId.value = undefined;
        return;
    }

    const item = props.items.find((item) => item.uid == props.focusItemUid);
    if (item) {
        const groupIndex = itemsGroupsList.value.findIndex((grp) => grp.base.id == item.id);
        if (groupIndex >= 0) {
            globalFocusItemIndex.value = groupIndex;
            focusItemId.value = item.id;
            
            const group = itemsGroupsList.value[groupIndex]!;
            const localIndex = group.items.findIndex((item) => item.uid == props.focusItemUid);

            if (localIndex >= 0) {
                localFocusItemIndex.value = localIndex;
            }
        }

    } else {
        globalFocusItemIndex.value = undefined;
        localFocusItemIndex.value = undefined;
        focusItemId.value = undefined;
    }
});

// const isActive = ref(false);
const shownGroupedItemsId: Ref<string | undefined> = ref(undefined);

function showGroupedItems(groupedItem: GroupedItems<T>) {
    shownGroupedItemsId.value = groupedItem.base.id;
    isActive.value = true;
}

watch(itemsGroups, (val) => {
    if (shownGroupedItemsId.value !== undefined && val[shownGroupedItemsId.value] === undefined) {
        shownGroupedItemsId.value = undefined;
        isActive.value = false;
    }
});

const compactGrid = ref(false);
</script>

<template>
    <slot
        name="filter"
        :filters="filters"
    >
        <item-filters
            v-model="filters"
            :default-filters="defaultFilters"
        >
            <template v-slot:activator="{ props: activatorProps }">
                <v-card class="sticky-header">
                    <v-row gap="0">
                        <v-col
                            cols="auto"
                        >
                            <v-card
                                class="pa-2 elevation-0 rounded-0"
                                @click="compactGrid = !compactGrid"
                            >
                                <v-icon
                                    v-if="compactGrid"
                                    size="large"
                                >
                                    mdi-grid
                                </v-icon>
                                <v-icon
                                    v-else
                                    size="large"
                                >
                                    mdi-grid-large
                                </v-icon>
                            </v-card>
                        </v-col>
                        <v-divider vertical />
                        <v-col>
                            <v-menu
                                transition="slide-y-transition"
                                :close-on-content-click="false"
                                v-model="menuSortByActive"
                            >
                                <template v-slot:activator="{props: menuActProps}">
                                    <v-card 
                                        v-bind="menuActProps"
                                        class="pa-2 h-100 d-flex align-center justify-center elevation-0 rounded-0"
                                    >
                                        <v-row>
                                            <v-col cols="auto">
                                                <v-icon
                                                    :icon="asc ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                                                    density="compact"
                                                    variant="text"
                                                    color="grey"
                                                />
                                            </v-col>
                                            <v-col class="h-100 d-flex align-center justify-center">
                                                {{ filteredItems.length }} items
                                            </v-col>
                                            <v-col cols="auto">
                                                <v-icon
                                                    :icon="sortBy.props.appendIcon"
                                                    density="compact"
                                                    variant="text"
                                                    color="grey"
                                                />
                                            </v-col>
                                        </v-row>
                                    </v-card>
                                </template>
                                <template v-slot="{isActive: menuIsActive}">
                                    <v-card>
                                        <v-row gap="0">
                                            <v-col
                                                cols="auto"
                                                class="d-flex justify-center pl-4 py-4"
                                            >
                                                <v-btn
                                                    :icon="asc ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                                                    density="compact"
                                                    variant="text"
                                                    @click="asc = !asc"
                                                />
                                            </v-col>
                                            <v-col>
                                                <v-list
                                                    :items="sortByOptions"
                                                    return-object
                                                    @click:select="(elem) => selectSortBy(elem.id, menuIsActive)"
                                                />
                                            </v-col>
                                        </v-row>
                                    </v-card>
                                    <!-- <v-card>
                                        <v-container fluid>
                                            <v-row gap="10">
                                                <v-col
                                                    cols="auto"
                                                    class="d-flex align-center"
                                                >
                                                    <v-btn
                                                        :icon="asc ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                                                        density="compact"
                                                        variant="text"
                                                        @click="asc = !asc"
                                                    />
                                                </v-col>
                                                <v-select
                                                    v-model="sortBy"
                                                    :items="sortByOptions"
                                                    :append-inner-icon="sortBy.props.appendIcon"
                                                    menu-icon=""
                                                    density="compact"
                                                    hide-details
                                                    return-object
                                                />
                                            </v-row>
                                        </v-container>
                                    </v-card> -->
                                </template>
                            </v-menu>
                        </v-col>
                        <v-divider vertical />
                        <v-col
                            cols="auto"
                        >
                            <v-card
                                v-bind="activatorProps"
                                class="pa-2 elevation-0 rounded-0"
                            >
                                <!-- <v-badge
                                    color="primary"
                                    dot
                                > -->
                                <v-icon
                                    v-if="filterCount > 0"
                                    size="large"
                                >
                                    mdi-filter
                                </v-icon>
                                <v-icon
                                    v-else
                                    size="large"
                                >
                                    mdi-filter-outline
                                </v-icon>
                                <div
                                    v-if="filterCount > 0"
                                    class="text-label-small my-badge px-1"
                                >
                                    {{ filterCount > 9 ? '9+' : filterCount }}
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card>
            </template>
        </item-filters>
    </slot>

    <div style="position: relative">
        <item-grid
            :item-count="itemsGroupsList.length"
            :max-item-height-ratio="compactGrid ? 0.15 : 0.25"
            :min-item-height-ratio="compactGrid ? 0.15 : 0.25"
            :scroll-elem="scrollElem"
            :focus-item-index="globalFocusItemIndex"
            class="mt-2"
            :="menuSortByActive ? {onClickCapture: withModifiers(() => {}, ['stop'])} : {}"
        >
            <template v-slot="{ i }">
                <local-scope
                    :scope="{ groupedItems: itemsGroupsList[i]! }"
                    v-slot="{ groupedItems }"
                >
                    <slot
                        name="activator"
                        :grouped-item="groupedItems"
                        :activate="() => showGroupedItems(groupedItems)"
                    >
                        <base-item-component
                            :item="groupedItems.base"
                            :key="i"
                            @click="showGroupedItems(groupedItems)"
                        >
                            <template v-slot:common-content="{ item }">
                                <slot
                                    name="activator-common-content"
                                    :item="item"
                                    :grouped-items="groupedItems"
                                />
                                <div
                                    class="position-absolute top-0 h-100 w-100 d-flex justify-center align-center"
                                    :class="item.id == focusItemId ? 'border-highlight' : ''"
                                    style="pointer-events: none"
                                >
                                    <v-container>
                                        <div
                                            class="position-absolute bottom-0 right-0 px-1 bg-white bordered border-opacity-100 border-sm rounded-be"
                                        >
                                            {{ groupedItems.items.length > 99 ? '99+' : groupedItems.items.length }}
                                        </div>
                                    </v-container>
                                </div>
                            </template>

                            <template v-slot:booster-content="{ booster }">
                                <slot
                                    name="activator-booster-content"
                                    :booster="booster"
                                    :grouped-items="groupedItems"
                                />
                            </template>

                            <template v-slot:card-content="{ card }">
                                <slot
                                    name="activator-card-content"
                                    :card="card"
                                    :grouped-items="groupedItems"
                                />
                            </template>
                        </base-item-component>
                    </slot>
                </local-scope>
            </template>
        </item-grid>
        <v-dialog
            v-model="isActive"
            class="on-top"
            transition="slide-y-transition"
            overlay-transition="slide-y-transition"
            content-class="anchored-dialog-content w-100"
            :content-props="dialogAnchor ? {style: `position-anchor: --${dialogAnchor};`} : {}"
        >
            <grouped-items-component
                v-if="shownGroupedItemsId && itemsGroups[shownGroupedItemsId]"
                :grouped-items="itemsGroups[shownGroupedItemsId]!"
                :focus-item-index="localFocusItemIndex"
                :compact="compactGrid"
            >
                <template v-slot="{ item }">
                    <base-item-component
                        :item="item"
                        @click="$emit('item-click', item)"
                    >
                        <template v-slot:common-content>
                            <slot
                                name="item-common-content"
                                :item="item"
                            />
                            <div
                                class="position-absolute top-0 h-100 w-100 d-flex justify-center align-center"
                                :class="item.uid == focusItemUid ? 'border-highlight' : ''"
                                style="pointer-events: none"
                            />
                        </template>

                        <template v-slot:booster-content="{ booster }">
                            <slot
                                name="item-booster-content"
                                :booster="booster"
                            />
                        </template>

                        <template v-slot:card-content="{ card }">
                            <slot
                                name="item-card-content"
                                :card="card"
                            />
                        </template>
                    </base-item-component>
                </template>
            </grouped-items-component>
        </v-dialog>
    </div>
</template>

<style scoped>
@keyframes border-pulse {
    0% {
        border-color: rgba(255, 0, 0, 1);
    }
    100% {
        border-color: rgba(255, 0, 0, 0);
    }
}

.border-highlight {
    border: solid 3px red;
    animation: border-pulse 1000ms 2s forwards;
    will-change: border-color;
}
</style>

<style scoped>
.sticky-header {
    position: sticky;
    top: -4px;
    z-index: 10;
}

.sticky-header:first-child {
    top: 0px;
    margin-top: 0px;
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
}

.sticky-header:not(:first-child) {
    margin-top: 4px;
}

.on-top > .v-overlay__content {
    position: absolute;
    top: 50%;
}

/* TODO : in a global css */
:deep(.anchored-dialog-content) {
    position: fixed !important;

    top: anchor(top, 0);
    width: calc(anchor-size(width, calc(100% - 24px)) - 24px) !important;
    max-height: calc(100% - 48px - (anchor-size(width, 0px) / anchor-size(width, 1px) * 24px))!important;
}

/* because vuetify badge sucks */
.my-badge {
    position: absolute;
    
    padding-right: 4px;
    padding-left: 4px;
    
    background-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
    top: 2px;
    right: 2px;
    border: solid 1px rgb(var(--v-theme-on-surface-variant));
    border-radius: 24px;
}
</style>