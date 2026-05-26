<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { getPokemonName } from '../controller/staticDataHelper';
import { Rarity } from '../../common/constants';

const {
    rarity,
} = defineProps<{
    rarity: Rarity,
}>();

// This depends on the image used
const ICON_HEIGHT = 40;
const ICON_WIDTH = 40;

const BACKGROUND_HEIGHT = 320;
const BACKGROUND_WIDTH = 160;

const mainElem = useTemplateRef("main");

const rarityToPos: Partial<Record<Rarity, { x: number, y: number }>> = {
    [Rarity.ACE_SPEC_RARE]: { x: 0, y: 0 },
    [Rarity.AMAZING_RARE]: { x: 1, y: 0 },
    [Rarity.CLASSIC_COLLECTION]: { x: 2, y: 0 },
    [Rarity.COMMON]: { x: 3, y: 0 },

    [Rarity.DOUBLE_RARE]: { x: 0, y: 1 },
    [Rarity.FULL_ART_TRAINER]: { x: 1, y: 1 },
    [Rarity.HOLO_RARE]: { x: 1, y: 1 },
    [Rarity.HOLO_RARE_V]: { x: 1, y: 1 },

    [Rarity.HOLO_RARE_VMAX]: { x: 1, y: 1 },
    [Rarity.HOLO_RARE_VSTAR]: { x: 1, y: 1 },
    [Rarity.HYPER_RARE]: { x: 2, y: 1 },
    [Rarity.ILLUSTRATION_RARE]: { x: 3, y: 1 },
    
    [Rarity.LEGEND]: { x: 0, y: 2 },
    [Rarity.NONE]: { x: 2, y: 0 },
    [Rarity.RADIANT_RARE]: { x: 1, y: 1 },
    [Rarity.RARE]: { x: 1, y: 2 },

    [Rarity.RARE_HOLO]: { x: 1, y: 1 },
    [Rarity.RARE_HOLO_LV_X]: { x: 1, y: 1 },
    [Rarity.RARE_PRIME]: { x: 1, y: 2 },
    [Rarity.SECRET_RARE]: { x: 1, y: 2 },

    [Rarity.SHINY_RARE]: { x: 2, y: 2 },
    [Rarity.SHINY_RARE_V]: { x: 2, y: 2 },
    [Rarity.SHINY_RARE_VMAX]: { x: 2, y: 2 },
    [Rarity.SHINY_ULTRA_RARE]: { x: 3, y: 2 },
    
    [Rarity.SPECIAL_ILLUSTRATION_RARE]: { x: 0, y: 3 },
    [Rarity.ULTRA_RARE]: { x: 0, y: 7 },
    [Rarity.UNCOMMON]: { x: 1, y: 3 },
    
    [Rarity.ONE_STAR]: { x: 0, y: 5 },
    [Rarity.TWO_STAR]: { x: 1, y: 5 },
    [Rarity.THREE_STAR]: { x: 2, y: 5 },
    [Rarity.CROWN]: { x: 3, y: 5 },
    [Rarity.ONE_DIAMOND]: { x: 0, y: 4 },
    [Rarity.TWO_DIAMOND]: { x: 1, y: 4 },
    [Rarity.THREE_DIAMOND]: { x: 2, y: 4 },
    [Rarity.FOUR_DIAMOND]: { x: 3, y: 4 },
    [Rarity.ONE_SHINY]: { x: 0, y: 6 },
    [Rarity.TWO_SHINY]: { x: 1, y: 6 },
    [Rarity.THREE_SHINY]: { x: 2, y: 6 },

    [Rarity.BLACK_WHITE_RARE]: { x: 2, y: 3 },
    [Rarity.MEGA_HYPER_RARE]: { x: 3, y: 3 },
    [Rarity.UNDEFINED]: { x: 3, y: 6 },
};

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

    style += `background-size: ${(targetWidth / ICON_WIDTH) * BACKGROUND_WIDTH}px ${(targetHeight / ICON_HEIGHT) * BACKGROUND_HEIGHT}px;`;
    style += "background-position: ";

    const rarityPos = rarityToPos[rarity];

    if (rarityPos) {
        const x = rarityPos.x * -targetWidth;
        const y = rarityPos.y * -targetHeight;
        style += `${x}px ${y}px`;
    } else {
        style += "40px 0px";
    }

    return style;
});

const name = computed(() => {
    return ""; // TODO : use getLangString
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
    background-image: url(/static/images/rarities.png);
    z-index: 0;
}
</style>