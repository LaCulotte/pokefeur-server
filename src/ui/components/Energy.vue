<script setup lang="ts">
import { Type } from '../../common/constants';

const {
    type,
    height = 25,
    text_proportion = 0.7
} = defineProps<{
    type: Type,
    height?: number
    text_proportion?: number
}>();

const energy_names: Record<Type, string> = {
    [Type.FIRE]: "Fire",
    [Type.WATER]: "Water",
    [Type.LIGHTNING]: "Electric",
    [Type.GRASS]: "Grass",
    [Type.PSYCHIC]: "Psychic",
    [Type.FIGHTING]: "Fighting",
    [Type.DARKNESS]: "Darkness",
    [Type.METAL]: "Metal",
    [Type.FAIRY]: "Fairy",
    [Type.COLORLESS]: "Colorless",
    [Type.DRAGON]: "Dragon",
    [Type.UNDEFINED]: "undefined",
}

const energy_class: Record<Type, string> = {
    [Type.FIRE]: "fire-energy",
    [Type.WATER]: "water-energy",
    [Type.LIGHTNING]: "lightning-energy",
    [Type.GRASS]: "grass-energy",
    [Type.PSYCHIC]: "psychic-energy",
    [Type.FIGHTING]: "fighting-energy",
    [Type.DARKNESS]: "darkness-energy",
    [Type.METAL]: "metal-energy",
    [Type.FAIRY]: "fairy-energy",
    [Type.COLORLESS]: "colorless-energy",
    [Type.DRAGON]: "dragon-energy",
    [Type.UNDEFINED]: "undefined-energy",
}
</script>

<template>
<div class="d-flex w-100 align-center">
    <div class="d-flex justify-center" style="min-width: 25px;" :style="`transform: scale(${height / 25}); width: ${(1 - text_proportion) * 100}%;`">
        <span :class="`energy ${energy_class[type]}`" :title="energy_names[type]"></span>
    </div>
    <div :style="`width: ${text_proportion * 100}%;`">
        <div class="w-100 d-flex justify-center" style="padding-right: 10%;">
            <slot></slot>
        </div>
    </div>
</div>
</template>

<style scoped>
.energy {
    background-image: url(/static/images/energies.png);
    height: 25px;
    width: 25px;
    display: inline-block;
    vertical-align: sub;
}

.fire-energy {
    background-position: 0 0;
}
.colorless-energy {
    background-position: -25px 0;
}
.fairy-energy {
    background-position: -50px 0;
}
.metal-energy {
    background-position: -75px 0;
}

.dragon-energy {
    background-position: 0 -25px;
}
.lightning-energy {
    background-position: -25px -25px;
}
.fighting-energy {
    background-position: -50px -25px;
}
.psychic-energy {
    background-position: -75px -25px;
}

.darkness-energy {
    background-position: 0 -50px;
}
.grass-energy {
    background-position: -25px -50px;
}
.undefined-energy {
    background-position: -50px -50px;
}
.water-energy {
    background-position: -75px -50px;
}
</style>