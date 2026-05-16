<script setup lang="ts">
const props = defineProps<{
    logo: string,
    name: string
}>();
</script>

<template>
    <div
        class="d-flex align-center justify-center w-100 h-100 booster-container"
        style="aspect-ratio: 245/337;"
    >
        <div
            class="booster-contained"
            style="aspect-ratio: 245/337;"
        >
            <v-responsive
                class="w-100 h-100"
                style="overflow: visible;"
            >
                <v-sheet
                    class="position-absolute top-0 w-100 h-100 pa-1"
                    elevation="2"
                    border="opacity-50 xl"
                    color="grey"
                    rounded="lg"
                    :title="name"
                >
                    <v-img
                        class="w-100 h-100"
                        style="overflow: visible;"
                        :src="logo"
                    />
                </v-sheet>
                <slot />
            </v-responsive>
        </div>
    </div>
</template>

<style scoped>
.booster-container {
  container: booster-container / size;
}

.booster-contained {
    height: auto;
    width: 100%; 
}

@container booster-container (aspect-ratio > 245/337) {
    .booster-contained {
        width: auto !important;
        height: 100% !important; 
    }
}
</style>