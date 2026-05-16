<script setup lang="ts" generic="T extends BaseItem">
import BaseItemComponent from './BaseItemComponent.vue';

import type { BaseItem } from '@/api/model/interfaces';

const { base } = defineProps<{
    base: T
}>();
</script>

<template>
    <v-row gap="12">
        <v-col
            cols="5"
            class="d-flex flex-column align-center justify-center"
        >
            <div
                class="w-100"
                style="aspect-ratio: 245/337; max-height: 25vh;"
            >
                <base-item-component 
                    :item="base"
                    :high-quality="true"
                />
            </div>
            <slot
                name="legend"
                :item="base"
            />
        </v-col>

        <v-col cols="7">
            <slot
                name="description-short"
                :item="base"
            />
        </v-col>
    </v-row>
    <v-container class="pa-1">
        <slot
            name="description-bottom"
            :item="base"
        />
    </v-container>
</template>