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
    <!-- <span>
        <v-btn @click="user.removeItem(item.uid)">x</v-btn>
    </span> -->
    <card v-if="item.type == 'card'" :item="item" class="">
        <v-btn @click="user.removeItem(item.uid)" color="error" density="compact" size="small" :icon="`mdi-cross`">x</v-btn>
    </card>
    <booster v-else :item="item" class="">
        <v-btn @click="user.removeItem(item.uid)" color="error" density="compact" size="small" :icon="`mdi-cross`">x</v-btn>
    </booster>
</template>