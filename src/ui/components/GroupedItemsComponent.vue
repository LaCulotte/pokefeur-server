<script setup lang="ts" generic="T extends InventoryItem">
import BaseItemComponent from './item/BaseItemComponent.vue';
import CardDisplay from './item/CardDisplay.vue';
import BoosterDisplay from './item/BoosterDisplay.vue';
import ItemGrid from './ItemGrid.vue';

import type { InventoryItem } from '@/api/model/interfaces';
import type { GroupedItems, GroupedCards, GroupedBoosters } from '@/ui/interfaces';
import { useTemplateRef } from 'vue';

const { groupedItems, focusItemIndex = undefined } = defineProps<{
    groupedItems: GroupedItems<T>
    focusItemIndex?: number,
}>();

const scrollElem = useTemplateRef("scroll-elem");
</script>

<template>
    <v-sheet
        class="on-top pa-2"
        style="overflow-x: hidden"
        ref="scroll-elem"
    >
        <card-display
            v-if="groupedItems.base.type === 'card'"
            :card="groupedItems.base as GroupedCards<T>['base']"
        />
        <booster-display
            v-else-if="groupedItems.base.type === 'booster'"
            :booster="groupedItems.base as GroupedBoosters<T>['base']"
        />

        <v-divider />

        <v-sheet style="overflow: auto;">
            <item-grid
                v-if="groupedItems.items.length > 0 && scrollElem !== null"
                :item-count="groupedItems.items.length"
                :max-item-height-ratio="0.20"
                :min-item-height-ratio="0.20"
                :scroll-elem="scrollElem.$el"
                :focus-item-index="focusItemIndex"
            >
                <template v-slot="{ i }">
                    <slot :item="groupedItems.items[i]!">
                        <base-item-component
                            :item="groupedItems.items[i]!"
                        />
                    </slot>
                </template>
            </item-grid>
        </v-sheet>
    </v-sheet>
</template>

<style scoped>
</style>