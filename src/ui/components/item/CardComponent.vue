<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import { getCardLangData } from '../../controller/staticDataHelper';

const { cardId, highQuality = false } = defineProps<{
    cardId: string,
    highQuality?: boolean
}>();

const itemStaticData = computed(() => {
    return getCardLangData(cardId).value;
});

const image = computed(() => {
    const suffix = highQuality ? "high" : "low";

    return itemStaticData.value.image?.length > 0 
        ? `${itemStaticData.value.image}/${suffix}.webp`
        : `/static/images/placeholders/missing_asset/card/${suffix}.webp`;    // TODO : could make it depend on type of underlying card
});

const name = computed(() => {
    return itemStaticData.value.name?.length > 0 ? itemStaticData.value.name : "No data";
});


function temp_replace(url: string): string {
    return url.replace("https://assets.tcgdex.net", `http://${window.location.hostname}:8000`);
}
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
            <v-responsive
                class="w-100 h-100"
            >
                <img
                    class="position-absolute top-0 w-100 h-100"
                    :src="temp_replace(image)"
                    :title="name"
                >
                <slot />
            </v-responsive>
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