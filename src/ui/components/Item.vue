<script setup lang="ts">
import type { InventoryItem } from "@/api/model/interfaces";

import Card from "./Card.vue"
import Booster from "./Booster.vue"
import { user } from "../data/user/vueUserData";

const props = defineProps<{
    item: InventoryItem
}>();

</script>

<template>
    <div class="d-flex align-center justify-center w-100 h-100" style="aspect-ratio: 245/337;">
        <div class="h-100" style="aspect-ratio: 245/337;">
            <card v-if="item.type == 'card'" :item="item">
                <v-btn
                class="position-absolute close-btn-pos"
                @click="user.removeItem(item.uid)"
                color="error"
                density="compact"
                size="small"
                :icon="`mdi-cross`"
                >
                    x
                </v-btn>
            </card>
            <booster v-else :item="item">
                <v-btn
                class="position-absolute close-btn-pos"
                @click="user.removeItem(item.uid)"
                color="error"
                density="compact"
                size="small"
                :icon="`mdi-cross`"
                >
                    x
                </v-btn>
            </booster>
        </div>
    </div>
</template>

<style lang="css">
/** Item aspect ratio is 245:337 */

.close-btn-pos {
    --pos: 2%;
    left: var(--pos); 
    top: calc(var(--pos) * 245 / 337)
}
</style>