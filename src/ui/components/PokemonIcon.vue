<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { getPokemonName } from '../controller/staticDataHelper';

const {
    id,
} = defineProps<{
    id: number,
}>();

const ICON_HEIGHT = 90;
const ICON_WIDTH = 120;

const BACKGROUND_HEIGHT = 12240;
const BACKGROUND_WIDTH = 1440;

const mainElem = useTemplateRef("main");

const style = computed(() => {
    if (!mainElem.value) {
        return "";
    }

    let targetWidth = mainElem.value.getBoundingClientRect().width;
    let targetHeight = mainElem.value.getBoundingClientRect().height;

    if (targetWidth / ICON_WIDTH > targetHeight / ICON_HEIGHT) {
        targetWidth = (targetHeight / ICON_HEIGHT) * ICON_WIDTH;
    } else if (targetWidth / ICON_WIDTH < targetHeight / ICON_HEIGHT) {
        targetHeight = (targetWidth / ICON_WIDTH) * ICON_HEIGHT;
    }

    let style = `width: ${targetWidth}px; height: ${targetHeight}px; `;

    style += `background-size: ${(targetWidth / ICON_WIDTH) * BACKGROUND_WIDTH}px ${(targetHeight / ICON_HEIGHT) * BACKGROUND_HEIGHT}px;`
    style += "background-position: "

    if (id < 1 || id > 1025) {
        style += "0px 0px";
    } else {
        const x = (id % 12) * -targetWidth;
        const y = Math.floor(id / 12) * -targetHeight;
        style += `${x}px ${y}px`;
    }

    return style;
});

const name = computed(() => {
    return getPokemonName(id).value;
});

</script>

<template>
    <div class="h-100 w-100">
        <div
            class="d-flex justify-center align-center h-100 w-100"
            style="overflow: visible;"
            ref="main"
        >
            <div
                :class="`icon`"
                :title="name"
                :style="style"
            />
        </div>
    </div>
</template>

<style scoped>
.icon {
    background-image: url(/static/images/pokemonicons-large.png);
    z-index: 0;
}
</style>