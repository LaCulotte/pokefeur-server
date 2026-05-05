<script setup lang="ts" generic="T extends InventoryItem">
import ItemGrid from './ItemGrid.vue';
import BaseItemComponent from './item/BaseItemComponent.vue';

import { computed, ref, onMounted, type ComputedRef, type Ref, watch } from 'vue';
import type { CardItem, InventoryItem } from '@/api/model/interfaces';

defineEmits(['item-click']);

const props = defineProps<{
    scrollElem?: HTMLDivElement | null,
    items: T[],
    focusItemUid?: string
}>();

const focusItemIndex: Ref<number | undefined> = ref(undefined);
watch(() => props.focusItemUid, () => {
    if (props.focusItemUid === undefined) {
        focusItemIndex.value = undefined;
        return;
    }

    const index = props.items.findIndex((item) => item.uid == props.focusItemUid );
    
    focusItemIndex.value = index >= 0 ? index : undefined;
});
</script>

<template>
    <item-grid
        v-if="items.length > 0"
        :item-count="items.length"
        :max-item-height-ratio="0.25"
        :min-item-height-ratio="0.25"
        :scroll-elem="scrollElem"
        :focus-item-index="focusItemIndex"
        class="mt-2"
    >
        <template v-slot="{ i }">
            <base-item-component
                :item="items[i]!"
                :key="i"
                @click="$emit('item-click', items[i])"
            >
                <template v-slot:common-content="{ item }">
                    <slot
                        name="common-content"
                        :item="item"
                    />
                    <div
                        :class="item.uid == focusItemUid ? 'border-highlight' : ''"
                        class="position-absolute top-0 h-100 w-100 d-flex justify-center align-center"
                        style="pointer-events: none"
                    />
                </template>

                <template v-slot:booster-content="{ booster }">
                    <slot
                        name="booster-content"
                        :booster="booster"
                    />
                </template>

                <template v-slot:card-content="{ card }">
                    <slot
                        name="card-content"
                        :card="card"
                    />
                </template>
            </base-item-component>
        </template>
    </item-grid>
</template>

<style lang="css">
/** Item aspect ratio is 245:337 */
/** TODO : make it a css variable */

.close-btn-pos {
    --pos: 2%;
    left: var(--pos);
    top: calc(var(--pos) * 245 / 337)
}
</style>

<style>
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