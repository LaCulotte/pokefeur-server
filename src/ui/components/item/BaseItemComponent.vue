<script setup lang="ts" generic="T extends BaseItem">
import type { Card, Booster, BaseItem } from "@/api/model/interfaces";
import BoosterComponent from "./BoosterComponent.vue";

import CardComponent from "./CardComponent.vue";

const props = defineProps<{
    item: T
}>();

</script>

<template>
    <card-component
        v-if="item.type == 'card'"
        :card-id="item.id"
    >
        <slot
            name="card-content"
            :card="item as (T & Card)"
        />
        <slot
            name="common-content"
            :item="item"
        />
    </card-component>
    <booster-component
        v-else
        :booster-id="item.id"
    >
        <slot
            name="booster-content"
            :booster="item as (T & Booster)"
        />
        <slot
            name="common-content"
            :item="item"
        />
    </booster-component>
</template>