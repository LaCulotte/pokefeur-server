<script setup lang="ts">
import type { InventoryItem } from "@/api/model/interfaces";
import BoosterItem from "./BoosterItem.vue";

import Card from "./Card.vue"
import { user } from "../data/user/vueUserData";

const props = defineProps<{
    item: InventoryItem
}>();

</script>

<template>

    <card v-if="item.type == 'card'" :card-id="item.id">
        <slot name="card-content" :card="item"></slot>
        <slot name="common-content" :item="(item as InventoryItem)"></slot>
    </card>
    <booster-item v-else :booster-id="item.id">
        <slot name="booster-content" :booster="item"></slot>
        <slot name="common-content" :item="(item as InventoryItem)"></slot>
    </booster-item>
</template>