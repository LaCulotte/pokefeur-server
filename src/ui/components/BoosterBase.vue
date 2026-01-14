<script setup lang="ts">
const props = defineProps<{
    logo: string,
    name: string
}>();
</script>

<template>
    <v-responsive class="w-100 h-100" style="aspect-ratio: 245/337; overflow: visible;">
        <v-sheet class="position-absolute top-0 w-100 h-100 pa-1" elevation="10" border="opacity-50 xl" color="grey" rounded="lg" :title="name">
            <v-img class="w-100 h-100" style="overflow: visible;" :src="logo">
            </v-img>
        </v-sheet>
        <slot></slot>
    </v-responsive>
</template>