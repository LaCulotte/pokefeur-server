<script setup lang="ts" generic="T extends InventoryItem">
import type { CardItem, BoosterItem, InventoryItem } from "@/api/model/interfaces";
import BoosterItemElem from "./BoosterItem.vue";

import Card from "./Card.vue"
import { user } from "../data/user/vueUserData";

const props = defineProps<{
    item: T
}>();

</script>

<template>

    <card v-if="item.type == 'card'" :card-id="item.id">
        <slot name="card-content" :card="item as (T & CardItem)"></slot>
        <slot name="common-content" :item="item"></slot>
    </card>
    <booster-item-elem v-else :booster-id="item.id">
        <slot name="booster-content" :booster="item as (T & BoosterItem)"></slot>
        <slot name="common-content" :item="item"></slot>
    </booster-item-elem>
</template>