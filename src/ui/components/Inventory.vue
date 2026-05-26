<script setup lang="ts" generic="T extends InventoryItem">
import ItemGrid from './ItemGrid.vue';
import ItemFilters from './ItemFilters.vue';
import BaseItemComponent from './item/BaseItemComponent.vue';

import { ref, type Ref, watch, computed, watchEffect } from 'vue';
import type { Card, Booster, InventoryItem, CardItem, BoosterItem } from '@/api/model/interfaces';
import type { GroupedItems, GroupedCards, GroupedBoosters } from '@/ui/interfaces';
import LocalScope from './LocalScope.vue';

import GroupedItemsComponent from './GroupedItemsComponent.vue';
import { Type } from '../../common/constants';
import type { Filters } from '../interfaces';
import { getCardLangData, getSetLangData } from '../controller/staticDataHelper';
import type { CardStaticLangData, SetStaticLangData } from '../../api/staticData/interfaces';
import { removeAccents } from '../../common/utils';

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

function checkPokemon(data: CardStaticLangData) {
    if (!data.dexId)
        return false;
    
    for (const id of data.dexId) {
        if ((props.defaultFilters?.pokemon ?? filters.value.pokemon).has(id)) {
            return true;
        }
    }

    return false;
}

function checkType(data: CardStaticLangData) {
    if (!data.types)
        return false;
    
    for (const type of data.types) {
        if ((props.defaultFilters?.energyType ?? filters.value.energyType).has(type)) {
            return true;
        }
    }

    return false;
}

function checkRarity(data: CardStaticLangData) {
    return (props.defaultFilters?.rarity ?? filters.value.rarity).has(data.rarity);
}

function checkName(data: SetStaticLangData | CardStaticLangData) {
    return removeAccents(data.name).includes(props.defaultFilters?.name ?? filters.value.name ?? '');
}

function checkItem(data: SetStaticLangData | CardStaticLangData) {
    return (props.defaultFilters?.itemId ?? filters.value.itemId) == data.id;
}

function checkCardSet(data: CardStaticLangData) {
    return (props.defaultFilters?.sets ?? filters.value.sets).has(data.setId);
}

function checkBoosterSet(data: SetStaticLangData) {
    return (props.defaultFilters?.sets ?? filters.value.sets).has(data.id);
}

// To be sorted ?
const filteredItems = computed(() => {
    let ret = props.items;

    const cardFilters: ((data: CardStaticLangData) => boolean)[] = [];
    const boosterFilters: ((data: SetStaticLangData) => boolean)[] = [];
    const bothFilters: ((data: SetStaticLangData | CardStaticLangData) => boolean)[] = [];

    if ((props.defaultFilters?.itemTypes ?? filters.value.itemTypes) == 'booster') {
        ret = ret.filter((item) => item.type == 'booster');

    } else if ((props.defaultFilters?.itemTypes ?? filters.value.itemTypes) == 'card') {
        ret = ret.filter((item) => item.type == 'card');

        if (filters.value.pokemon.size || props.defaultFilters?.pokemon?.size) {
            cardFilters.push(checkPokemon);
        }

        if (filters.value.energyType.size || props.defaultFilters?.energyType?.size) {
            cardFilters.push(checkType);
        }

        if (filters.value.rarity.size || props.defaultFilters?.rarity?.size) {
            cardFilters.push(checkRarity);
        }
    }

    if (filters.value.sets.size || props.defaultFilters?.sets?.size) {
        cardFilters.push(checkCardSet);
        boosterFilters.push(checkBoosterSet);
    }


    if (filters.value.name?.length || props.defaultFilters?.name?.length) {
        bothFilters.push(checkName);
    }

    if (filters.value.itemId || props.defaultFilters?.itemId) {
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

// Regroup the items per type & id
const itemsGroups: Ref<Record<string, GroupedItems<T>>> = computed(() => {
    const ret: Record<string, GroupedItems<T>> = {};

    for (const item of filteredItems.value) {
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

// To be sorted ?
const itemsGroupsList = computed(() => Object.values(itemsGroups.value));

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
                <v-card
                    class="sticky-header"
                >
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
                        <v-col
                            class="pa-2 d-flex align-center justify-center"
                        >
                            {{ filteredItems.length }} items
                        </v-col>
                        <v-divider vertical />
                        <v-col
                            cols="auto"
                        >
                            <v-card
                                v-bind="activatorProps"
                                class="pa-2 elevation-0 rounded-0"
                            >
                                <v-icon size="large">
                                    mdi-filter
                                </v-icon>
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
</style>