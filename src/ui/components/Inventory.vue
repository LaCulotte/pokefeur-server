<script setup lang="ts" generic="T extends InventoryItem">
import ItemGrid from './ItemGrid.vue';
import BaseItemComponent from './item/BaseItemComponent.vue';

import { ref, type Ref, watch, computed, watchEffect } from 'vue';
import type { Card, Booster, InventoryItem, CardItem, BoosterItem } from '@/api/model/interfaces';
import type { GroupedItems, GroupedCards, GroupedBoosters } from '@/ui/interfaces';
import LocalScope from './LocalScope.vue';

import GroupedItemsComponent from './GroupedItemsComponent.vue';

defineEmits(['item-click']);

const props = defineProps<{
    scrollElem?: HTMLDivElement | null,
    items: T[],
    focusItemUid?: string,
    dialogAnchor?: string
}>();

const isActive = defineModel<boolean>('dialogActive', { default: false });

// Regroup the items per type & id
const itemsGroups: Ref<Record<string, GroupedItems<T>>> = computed(() => {
    const ret: Record<string, GroupedItems<T>> = {};

    for (const item of props.items) {
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
    
    // const index = props.items.findIndex((item) => item.uid == props.focusItemUid);
    // focusItemIndex.value = index >= 0 ? index : undefined;    
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
</script>

<template>
    <div style="position: relative">
        <item-grid
            v-if="itemsGroupsList.length > 0"
            :item-count="itemsGroupsList.length"
            :max-item-height-ratio="0.25"
            :min-item-height-ratio="0.25"
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