<script setup lang="ts">
import BoosterBase from '../components/BoosterBase.vue';
import Item from '../components/Item.vue';

import { user } from '../data/user/vueUserData';

import { ref, type Ref, computed, onUnmounted, onMounted, type ComputedRef } from 'vue';
import { useRouter } from 'vue-router'
import { on } from 'events';
import Energy from '../components/Energy.vue';
import DealProposition from '../components/DealProposition.vue';
import type { FullDeal, InventoryItem } from '@/api/model/interfaces';
import { getItemLangData } from '../controller/staticDataHelper';

document.title = "Dealership";

const toRedeem = computed(() => {
    return Object.values(user.data.deals).filter((deal) => { return deal.state === "accepted";});
});

const toAccept = computed(() => {
    return Object.values(user.data.deals).filter((deal) => { return deal.state === "proposed";});
});

const disabledDeals = computed(() => {
    return Object.values(user.data.deals).filter((deal) => { return deal.state !== "proposed";});
});

const now = ref(0);
const updating = ref(false);

const nextDealUpdate: ComputedRef<number> = computed(() => {
    let nextUpdate = Infinity;
    
    Object.values(user.data.deals).forEach((deal) => {
        if (deal.state === "proposed" || deal.state === "redeemed") {
            const dealExpiryTime = (deal.proposedDate ?? 0) + deal.timeoutDuration;
            
            if (dealExpiryTime < nextUpdate) {
                nextUpdate = dealExpiryTime;
            }
        }
    });

    return nextUpdate;
});

async function tick() {
    now.value = Math.floor(Date.now() / 1000);

    if (!updating.value && now.value > nextDealUpdate.value) {
        updating.value = true;
        await user.launchLoad();
        updating.value = false;
    }
}

let tickInterval: NodeJS.Timeout | undefined = undefined;

onMounted(async () => {
    await user.loadPromise;
    await tick();
    tickInterval = setInterval(tick, 1000);
});

onUnmounted(() => {
    clearInterval(tickInterval);
});

const router = useRouter();

function goToCollection(itemId?: string) {
    router.push({
        path: "/collection",
        // hash: hash
        query: {
            itemId
        }
    });
}


function goToHome(itemId?: string) {
    router.push({
        path: "/",
        query: {
            itemId
        }
    });
}

const showRedeemed = ref(false);
const redeemed: Ref<InventoryItem | null> = ref(null);

async function redeem(dealUid: string) {
    let res = await user.redeemDeal(dealUid);

    if (!res.has_value()) {
        console.error("Oh no :(");
        return;
    }

    redeemed.value = res.value().newItem;
    showRedeemed.value = true;
}

async function testRedeem() {
    redeemed.value = {
        id: "base1-50",
        type: "card",
        uid: ""
    };
    showRedeemed.value = true;
}
</script>

<template>
    <div class="main w-screen h-screen pa-2" style="background-color: #b0ceceaf;">
        <v-responsive v-for="deal in toRedeem" class="panel-main ma-2" style="overflow: visible;">
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
                    :model-value="(((deal.startDate ?? 0) + deal.totalWaitTime - now) / deal.totalWaitTime) * 100"
                    rounded
                    style="background-color: rgba(0, 0, 0, 0.2);"

                    v-if="(deal.startDate ?? 0) + deal.totalWaitTime > now"
                    >
                        <div class="box-child w-100 h-100" style="
                            box-shadow: inset 0 0 2px; position: absolute;
                            pointer-events: none;
                            top: 0;
                            left: 0;
                        "></div>
                        <strong class="loading-text">Booster en cours; {{ (deal.startDate ?? 0) + deal.totalWaitTime - now }}s restantes ...</strong>
                    </v-progress-linear>
                    <v-btn
                    v-else
                    @click="redeem(deal.uid)"
                    >
                        Redeem
                    </v-btn>
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
                    class="no-padding"
                    style="height: 45vh;
                    overflow: scroll;
                    overscroll-behavior: none;"
                >
                    <!-- <v-btn @click="testRedeem()">test</v-btn> -->
                    <deal-proposition
                    v-for="deal in toAccept"
                    :key="deal.uid"
                    :deal="deal"
                    :now="now"
                    class="flex-fill border-bottom"
                    style="height: 33%; min-height: 120px;"
                    >
                    </deal-proposition>

                    <div class="mini-spacer"></div>
                    
                    <deal-proposition
                    v-for="deal in disabledDeals"
                    :key="deal.uid"
                    :deal="deal"
                    disabled
                    :now="now"
                    class="flex-fill border-bottom-faded"
                    style="height: 33%; min-height: 120px; opacity: 0.5;"
                    >
                    </deal-proposition>
                    <div class="mini-spacer"></div>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
        
        <div class="position-absolute d-flex" style="bottom: 5%; left: 5%; z-index: 20;">
            <v-btn class="collection-btn" rounded="xl" icon="mdi-home" @click="goToHome()"></v-btn>
            <!-- <div class="flex-shrink-0" style="flex: 2 2;"></div> -->
        </div>
    </div>

    <v-dialog
    v-if="redeemed !== null"
    v-model="showRedeemed"
    >
        <v-sheet style="overflow: hidden;">
            <div class="w-100 pa-2" style="text-align: center; font-weight: 800; font-size: 20px;">
                Got a new item : 
            </div>
            <v-divider></v-divider>
            <v-row class="pa-2">
                <v-col>
                    <div style="text-align: end; font-weight: 600; font-size: 16px;">
                        New {{ redeemed.type }}: 
                    </div>
                </v-col>
                <v-col>
                    <div style="text-align: start; font-size: 16px;">
                    {{ getItemLangData(redeemed.type, redeemed.id).value.name }}
                    </div>
                </v-col>
            </v-row>
            <item
            class="mb-3 flex-1-1"
            :item="redeemed"
            style="max-height: 20vh;"
            >
            </item>
            <v-toolbar class="pl-2 pr-2">
                <v-spacer></v-spacer>
                <v-btn
                class="mr-2"
                color="success"
                variant="flat"
                @click="goToCollection(redeemed.uid)"
                >
                    Go >
                </v-btn>

                <v-btn
                variant="outlined"
                @click="showRedeemed = false"
                >
                    CLOSE
                </v-btn>
                
            </v-toolbar>
        </v-sheet>
    </v-dialog>

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

:deep(.no-padding) .v-expansion-panel-text__wrapper {
    padding: 0 !important;
}

.border-right {
    border-right: 1px solid rgba(0,0,0,0.3);
}
.border-bottom {
    border-bottom: 1px solid rgba(0,0,0,0.8);
}
.border-bottom-faded {
    border-bottom: 1px solid rgba(0,0,0,0.5);
}
</style>