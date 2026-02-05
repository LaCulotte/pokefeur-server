<script setup lang="ts">
import Energy from './Energy.vue';
import type { Deal, DealCostUnit } from '../../api/model/interfaces';
import { Type } from '../../common/constants';
import Item from './Item.vue';
import { computed, type ComputedRef } from 'vue';

// interface DealCostUnitDisplay extends DealCostUnit {
    
// }

type DealCostUnitDisplay = DealCostUnit & { grayed: boolean };

const props = defineProps<{
    dealCost: Deal["cost"],
    selectedItems?: Array<string>
}>();

const computedCost: ComputedRef<Array<DealCostUnitDisplay>> = computed(() => {
    let ret: Array<DealCostUnitDisplay> = [];
    for (let unit of props.dealCost) {
        ret.push({
            ...unit,
            grayed: props.selectedItems !== undefined
        });
    }

    if (props.selectedItems !== undefined) {
        for (let itemId of props.selectedItems) {
            let a = ret.find((c) => {
                return c.id === itemId && c.grayed;
            });

            if (a !== undefined) {
                a.grayed = false;
            }
        }
    }

    return ret.sort((a, b): number => {
        if (a.type === b.type) {
            return 0;
        }
        if (a.type === "energy") {
            return 1;
        }
        return -1;
    });
});

// const grayedCost: ComputedRef<Array<string>> = computed(() => {
//     return [];
// });

</script>

<template>
    <div class="cost-grid">
        <div
            v-for="(c, idx) in computedCost"
            :key="idx"
            :class="['cost-item', 'position-relative', c.type === 'energy' ? 'energy' : 'card']"
        >
            <energy
                v-if="c.type === 'energy'"
                :key="`${idx}-energy`"
                :type="c.id"
                :height="20"
                :text_proportion="0.5"
                class=""
            >
                <div class="w-100 d-flex justify-begin">
                    x {{ c.count }}
                </div>
            </energy>
            <item
                v-else-if="c.type === 'card'"
                :key="`${idx}-card`"
                :item="
                    {
                        id: c.id!,
                        uid: '',
                        type: 'card',
                    }
                "
            >
                <template v-slot:common-content>
                    <!-- v-if="c.grayed" -->
                    <div
                    class="position-absolute top-0 w-100 h-100 fade"
                    :class="[c.grayed ? 'show' : '']"
                    style="background-color: rgba(0, 0, 0, 0.5);"></div>
                </template>                
            </item>
            <item
                v-else
                :key="`${idx}-booster`"
                :item="
                    {
                        id: c.id!,
                        uid: '',
                        type: 'booster',
                    }
                "
            >
                <template v-slot:common-content>
                    <!-- v-if="c.grayed" -->
                    <div
                    class="position-absolute top-0 w-100 h-100 fade"
                    :class="[c.grayed ? 'show' : '']"
                    style="background-color: rgba(0, 0, 0, 0.5);"></div>
                </template>
            </item>

        </div>
    </div>
</template>

<style scoped>
.cost-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr); /* two columns */
    grid-auto-rows: 50%; /* base row height — adjust as needed */
    gap: 5px;
    align-items: center;
}
.cost-item.card {
    grid-row: span 2;
    grid-column: span 4;
    height: 100%;
}
.cost-item.energy {
    grid-column: span 4;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
}

/* .cost-item > energy,
.cost-item > item {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
} */

.fade {
  opacity: 0;
  transition: opacity 300ms ease;
  will-change: opacity;
}
.fade.show {
  opacity: 1;
}
</style>