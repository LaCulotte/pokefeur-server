<script setup lang="ts">
import type { InventoryItem } from "@/api/data/interfaces";

import Card from "./Card.vue"
import Booster from "./Booster.vue"
import { user } from "../data/user/vueUserData";

const props = defineProps<{
    item: InventoryItem
}>();

</script>

<template>
    <span>
        <button @click="user.removeItem(item.uid)">x</button>
    </span>
    <span style="margin-right: 10px;">
        <card v-if="item.type == 'card'" :item="item"></card>
        <booster v-else :item="item"></booster>
    </span>
</template>