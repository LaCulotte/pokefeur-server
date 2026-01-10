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
    <div class="d-flex align-center justify-center w-100 h-100" style="aspect-ratio: 245/337;">
        <div class="h-100" style="aspect-ratio: 245/337;">
            <card v-if="item.type == 'card'" :item="item">
                <slot name="card-content" :card="item"></slot>
                <slot name="common-content" :item="(item as InventoryItem)"></slot>
            </card>
            <booster-item v-else :item="item">
                <slot name="booster-content" :booster="item"></slot>
                <slot name="common-content" :item="(item as InventoryItem)"></slot>
            </booster-item>
        </div>
    </div>
</template>