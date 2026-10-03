<script setup lang="ts">
const props = defineProps<{
    image: string,
    name: string
}>();
</script>

<template>
    <div
        class="d-flex align-center justify-center w-100 h-100 card-container"
        style="aspect-ratio: 245/337;"
    >
        <div
            class="card-contained"
            style="aspect-ratio: 245/337;"
        >
            <div
                class="w-100 h-100 position-relative"
            >
                <img
                    class="position-absolute top-0 w-100 h-100"
                    :src="image"
                    :title="name"
                >
                <slot />
            </div>
        </div>
    </div>
</template>

<style scoped>
.card-container {
  container: card-container / size;
}

.card-contained {
    height: auto;
    width: 100%; 
}

@container card-container (aspect-ratio > 245/337) {
    .card-contained {
        width: auto !important;
        height: 100% !important; 
    }
}
</style>