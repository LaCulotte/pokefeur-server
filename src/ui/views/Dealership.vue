<script setup lang="ts">
import Item from '../components/Item.vue';
import BoosterBase from '../components/BoosterBase.vue';
import type { BoosterItem } from '../../api/model/interfaces';

import { ref, type Ref } from 'vue';

document.title = "Dealership";

let item: Ref<BoosterItem> = ref({
    uid: "",
    type: "booster",
    id: "???"
});
</script>

<template>
    <div class="main w-screen h-screen pa-2" style="background-color: #b0ceceaf;">
        <v-responsive  v-for="i in [1, 1, 1, 1, 1, 1, 1, 1, ]" class="panel-main ma-2" style="overflow: visible;">
            <v-sheet class="h-100 w-100 border"
                rounded="xl"
                color=""
                style="box-shadow: 0 3px 7px rgba(0, 0, 0, 0.5);"
                >
            </v-sheet>
            <svg style="position: absolute; width: 0; height: 0;">
                <clipPath id="my-clip-path" clipPathUnits="objectBoundingBox">
                    <path d="M0,0.75,1,0.4,1,1,0,1Z"></path>
                </clipPath>
            </svg>
            <v-sheet class="position-absolute top-0 h-100 w-100"
                rounded="xl"
                color="#7baeafaf"
                style='clip-path: url(#my-clip-path);'
                >
            </v-sheet>
            <div class="position-absolute top-0 w-100 h-100 pa-2 d-flex flex-column align-center">
                <div class="h-75 w-100 d-flex flex-row align-center justify-space-evenly">
                    <div class="h-100 d-flex align-center justify-center" style="flex:5 5">
                        <strong>Booster</strong>
                    </div>
                    <div class="flex-1-1 h-100 d-flex align-center justify-begin">
                        <div
                            class="booster-css"
                        >
                            <booster-base 
                            ref="booster"
                            logo="https://upload.wikimedia.org/wikipedia/commons/5/5a/Black_question_mark.png" 
                            name=""
                            @contextmenu.prevent
                            @dragstart.prevent
                            >
                            <div class="position-absolute top-0 h-100 w-100"></div>
                            </booster-base>
                        </div>
                    </div>
                </div>
                <div class="flex-fill w-100 pa-2 d-flex align-center">
                    <v-progress-linear
                    class="h-100"
                    color="light-green-darken-4"
                    model-value="50"
                    rounded
                    style="background-color: rgba(0, 0, 0, 0.2);"
                    >
                        <div class="box-child w-100 h-100" style="
                            box-shadow: inset 0 0 2px; position: absolute;
                            pointer-events: none;
                            top: 0;
                            left: 0;
                        "></div>
                        <strong class="loading-text">Booster en cours; 69 mins restantes ...</strong>
                    </v-progress-linear>
                </div>
            </div>
        </v-responsive>
    </div>
    <div class="sticky-footer">
        <v-expansion-panels style="background: none;" v-bind:model-value="['panel']">
            <v-expansion-panel
                value="panel"
                style="border-top: 1px solid; border-left: 1px solid; border-right: 1px solid; border-radius: 15px 15px 0px 0px;"
                elevation="10"
            >
                <v-expansion-panel-title
                    class=""
                    style="height: 5vh; min-height: 0; box-shadow: 0px 3px 10px -6px black;"
                >
                    <template v-slot:actions="{expanded}">   
                        <v-icon :icon="expanded ? 'mdi-chevron-down': 'mdi-chevron-up'"></v-icon>
                    </template>                    
                    <template v-slot:default="">
                        <v-row no-gutters class="h-100 w-100 position-absolute top-0 left-0 align-center">
                            <v-col align="center">
                                Dealership
                            </v-col>
                        </v-row>
                    </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text
                    style="height: 45vh;
                    overflow: scroll;
                    overscroll-behavior: none;
                    "

                    class="text-panel"
                >
                    <v-responsive v-for="i in [1, 1, 1, 1, 1, 1, 1, 1, ]" 
                        class="panel" 
                        style="overflow: visible;
                        height: 20%;
                        min-height: 80px;
                        margin-bottom: 3%;"
                    >
                        <!-- Background : -->
                        <v-sheet class="h-100 w-100 border"
                            rounded="xl"
                            color=""
                            style="box-shadow: 0 3px 7px rgba(0, 0, 0, 0.5);"
                            >
                        </v-sheet>
                        <!-- Content -->
                        <div class="position-absolute top-0 h-100 w-100 d-flex">
                            <div class="d-flex flex-column" style="flex: 2 2 100%;">
                                <div class="flex-fill w-100 h-50 d-flex align-center">
                                    <div style="padding-top: 10%; padding-left: 15%;">
                                        <strong>Booster</strong>
                                    </div>
                                </div>
                                <div class="flex-fill w-100 h-50 d-flex align-center">
                                    <div style="padding-bottom: 0%; padding-left: 15%;">
                                        5 cards
                                    </div>
                                </div>
                            </div>
                            <div style="flex: 3 3 100%;">
                                <div class="h-100 w-100 pa-3 d-flex flex-column justify-center align-center ">
                                    <v-btn color="success">Select</v-btn>
                                </div>
                            </div>
                        </div>
                    </v-responsive>
                    <div class="mini-spacer"></div>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>

<style scoped>
.main {
    overflow: auto;
}

.center-elem {
    display: flex;
    justify-content: center;
    align-content: center;
}

.panel-main {
    height: 20%;
    min-height: 180px;
    /* max-height: 30%;
    min-height: 30%; */

    /* --intensity: 1.5;

    box-shadow: 0px 10px 13px -6px var(--v-shadow-key-umbra-opacity, rgba(173, 216, 230, calc(var(--intensity) * 0.2))), 
                0px 20px 31px 3px var(--v-shadow-key-penumbra-opacity, rgba(173, 216, 230, calc(var(--intensity) * 0.141))), 
                0px 8px 38px 7px var(--v-shadow-key-ambient-opacity, rgba(173, 216, 230, calc(var(--intensity) * 0.122))) */
}

.booster-css {
    height: 90%;
    aspect-ratio: 245/337;

    --intensity: 1;

    /* box-shadow: 0 3px 7px rgba(0, 0, 0, 0.7); */
    user-select: none;

    touch-action: manipulation; /* allow scrolling/panning but minimize unwanted gestures */

    /* transition: box-shadow 140ms ease, transform 140ms ease; */
}

.loading-text {
    color: white;

    /* text-shadow: 1px 0 #fff, -1px 0 #fff, 0 1px #fff, 0 -1px #fff,
                1px 1px #fff, -1px -1px #fff, 1px -1px #fff, -1px 1px #fff; */

    /* -webkit-text-stroke: 0.1em white; */
}

.sticky-footer {
    position: sticky;
    bottom: 0;
    z-index: 10;
    background: none;
}

.v-progress-linear > *:has(.box-child) {
    border-radius: inherit;
}

.v-progress-linear > *:has(.box-child) > * {
    border-radius: inherit;
}

.mini-spacer {
    height: 1px;
}

</style>