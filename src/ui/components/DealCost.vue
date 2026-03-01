<script setup lang="ts">
import Energy from './Energy.vue';
import type { Deal, DealCostUnit, InventoryItem } from '../../api/model/interfaces';
import { isCardOfType } from '../../common/checks';
import { Type } from '../../common/constants';
import Item from './Item.vue';
import { computed, type ComputedRef } from 'vue';
import BoosterBase from './BoosterBase.vue';
import Card from './Card.vue';
import { getSetLangData } from '../controller/staticDataHelper';

const {
    items = [],
    energies = {},
} = defineProps<{
    items?: Deal["cost"]["items"],
    energies?: Deal["cost"]["energies"],
}>();

defineEmits(['cost-click']);

const TYPE_TO_CARD_ID: Record<Type, string> = {
    [Type.UNDEFINED]: "none",
    [Type.COLORLESS]: "swsh3-176",
    [Type.GRASS]: "xy1-132",
    [Type.FIRE]: "xy1-133",
    [Type.WATER]: "xy1-134",
    [Type.LIGHTNING]: "xy1-135",
    [Type.PSYCHIC]: "xy1-136",
    [Type.FIGHTING]: "xy1-137",
    [Type.DARKNESS]: "xy1-138",
    [Type.METAL]: "xy1-139",
    [Type.FAIRY]: "xy1-140",
    [Type.DRAGON]: "xy6-97",
    [Type.TYPE_COUNT]: "none",
};

function costUnitToItem(costUnit: DealCostUnit): InventoryItem {
    if (costUnit.type == "booster" || costUnit.type == "card") {
        return {
            id: costUnit.id,
            type: costUnit.type,
            uid: ""
        }
    } else if (costUnit.type == "card-of-type") {
        return {
            id: TYPE_TO_CARD_ID[costUnit.id],
            type: "card",
            uid: ""
        }
    }

    return {
        id: "none",
        type: "card",
        uid: ""
    }
}

function getSetLogo(setId: string): string {
    let setData = getSetLangData(setId).value;
    return setData?.logo?.length > 0 ? `${setData.logo}.webp` : "/static/images/placeholders/missing_asset/logo.webp";
};

</script>

<template>
    <div class="cost-grid">
        <div
            v-for="(cost, idx) in items"
            :key="idx"
            :class="['cost-item', 'position-relative', 'card']"
        >
            <item
                v-if="cost.type == 'booster' || cost.type == 'card' || cost.type == 'card-of-type'"
                :key="`${idx}-item`"
                :item="costUnitToItem(cost)"
                @click="$emit('cost-click', cost, idx)"
            >
                <template v-slot:common-content>
                    <slot name="item-cost" :cost="cost" :idx="idx"></slot>
                </template>
            </item>
            <!-- <div
                v-else-if="cost.type == 'card-of-set'"
                :key="`${idx}-of-set`"
                style="aspect-ratio: 245/337; height: 100%;"
                @click="$emit('cost-click', cost, idx)"
            >
                <booster-base
                    logo="/static/images/placeholders/missing_asset/card/low.webp"
                    name="salut"
                >
                    <slot name="item-cost" :cost="cost" :idx="idx"></slot>
                </booster-base>
            </div> -->
            <!-- TODO : make a better  -->
            <card
            v-else-if="cost.type == 'card-of-set'"
            :key="`${idx}-of-set`"
            card-id="sm7.5-1"
            @click="$emit('cost-click', cost, idx)"
            >
                <v-img class="w-100 h-100" style="overflow: visible;" :src="getSetLogo(cost.id)">
                </v-img>
                <slot name="item-cost" :cost="cost" :idx="idx"></slot>
            </card>
            <div v-else>
                {{ 
                    //@ts-ignore
                    cost.type  
                }}
                Not implemented yet :c
            </div>
        </div>
        <div
            v-for="(count, idx) in energies"
            :key="idx"
            :class="['cost-item', 'position-relative', 'energy']"
        >
            <energy
                :key="`${idx}-energy`"
                :type="parseInt(idx)"
                :height="20"
                :text_proportion="0.5"
                class=""
            >
                <div class="w-100 d-flex justify-begin">
                    x {{ count }}
                </div>
            </energy>
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