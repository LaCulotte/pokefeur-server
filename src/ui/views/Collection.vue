<script setup lang="ts">
import AdminDashboard from "../components/AdminDashboard.vue";
import Inventory from "../components/Inventory.vue";
import Energy from "../components/Energy.vue";

import { onMounted, onUnmounted, useTemplateRef, ref, computed, watch, nextTick } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

import { user } from '../data/user/vueUserData';
import { staticDataStore } from '../data/static/vueStaticData';
import { lang } from '../controller/lang';
import { Category, SUPPORTED_ENERGY_TYPES, Type } from '../../common/constants';

import type { CardItem, InventoryItem } from '@/api/model/interfaces';

const router = useRouter();

document.title = "Collection";

const { xlAndUp, lgAndUp, smAndDown } = useDisplay();
const energyColsSize = computed(() => {
    return xlAndUp.value ? 2
        : lgAndUp.value ? 2
        : smAndDown.value ? 4
        : 3;
});

// This whole thing is to 'lock up' the inventory height
// This is done to not have 'jumps' when removing elements at the end of the inventory
const lastElem = useTemplateRef("last-elem");
const scrollElem = useTemplateRef("scroll-inventory");
const resizedElem = useTemplateRef("inventory-parent");
// const insideElem = useTemplateRef("inside-elem");
const lockedHeight = ref(0);
const paddingHeight = ref(0);

// Cannot add more after 'resizedElem' with this setup
function scrollBehaviour() {
    let newHeight = (window.visualViewport?.height ?? window.innerHeight) - (resizedElem.value?.getBoundingClientRect().top ?? 0);

    newHeight -= (lastElem.value?.getBoundingClientRect().bottom ?? 0) - (resizedElem.value?.getBoundingClientRect().bottom ?? 0);

    if (newHeight <= 1) {
        lockedHeight.value = 0;
        paddingHeight.value = 0;
        return;
    }

    lockedHeight.value = newHeight;
    // paddingHeight.value = newHeight - (insideElem.value?.getBoundingClientRect().height ?? newHeight);
}

const style = computed(() => {
    const h = lockedHeight.value > 0 ? lockedHeight.value : 0;
    return {
        // 'min-height': `${h}px`
    };
});

const items = computed(() => Object.values(user.data.inventory.items));
const tradeItems = computed(() => Object.values(user.data.inventory.inTradeItems));

// TODO : make this function common
function isCardRecyclable(card: CardItem) {
    const cardData = staticDataStore[lang.value]?.cards[card.id];

    if (cardData === undefined) {
        return false;
    }

    if(![Category.POKEMON, Category.ENERGY].includes(cardData.category) || (cardData.types === undefined)) {
        return false;
    }

    for (const type of cardData.types) {
        if (!SUPPORTED_ENERGY_TYPES.includes(type)) {
            return false;
        }
    }

    return true;
}

function removeItem(uid: string) {
    user.removeItem(uid);
}

const focusedItemUid: Ref<string | undefined> = ref(undefined);
onMounted(() => {
    if (!!scrollElem.value) {
        scrollElem.value.addEventListener("scroll", scrollBehaviour);
    } else {
        document.addEventListener("scroll", scrollBehaviour);
    }
    scrollBehaviour();

    setTimeout(() => {
        const queryItemId = router.currentRoute.value.query.itemId;
        if (queryItemId != undefined) {
            focusedItemUid.value = queryItemId.toString();
        }
    }, 200);
});

function unfocus() {
    setTimeout(() => {
        focusedItemUid.value = undefined;
    }, 2000);
}

onUnmounted(() => {
    if (!!scrollElem.value) {
        scrollElem.value.removeEventListener("scroll", scrollBehaviour);
    } else {
        document.removeEventListener("scroll", scrollBehaviour);
    }
});

// import { useGoTo } from "vuetify";

// const goTo = useGoTo();
// const scroll = ref(100);

// watch(scroll, async () => {
//     if (!scrollElem.value) {
//         return;
//     }

//     const to = scrollElem.value.scrollHeight * Math.floor(100 - scroll.value) / 100;

//     scrollElem.value.scroll({
//         'top': to,
//         'behavior': 'instant'
//     });

//     // goTo(to, {
//     //     container: scrollElem.value,
//     //     easing: 'linear'
//     // });
// });
</script>

<template>
    <div>
        <div class="sticky-header pa-2">
            <v-expansion-panels style="background: none;">
                <v-expansion-panel
                    title="Admin"
                >
                    <v-expansion-panel-text>
                        <admin-dashboard />
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
            <!-- <v-btn @click="scroll -= 1">
                v
            </v-btn>
            <v-btn @click="scroll += 1">
                ^
            </v-btn> -->
            <!-- <v-slider
                v-model="scroll"
                direction="vertical"
            /> -->
            <!-- {{ scroll }} -->
        </div>

        <div class="position-absolute top-0 w-100 h-screen">
            <v-btn
                class="position-absolute d-flex" 
                style="bottom: var(--btn-offset); left: var(--btn-offset); z-index: 20;"
                rounded="xl"
                icon="mdi-home"
                to="/"
            />
        </div>

        <div
            class="position-absolute d-flex flex-column top-0 w-100 h-100 inventory-scroll"
            ref="scroll-inventory"
            id="scroll-inventory"
            
            style="background-color: rgba(95, 158, 160, 0.4); overflow: auto;"
        >
            <div
                class="sticky-header pa-2"
                style="z-index: -10; visibility: hidden;"
            >
                <v-expansion-panels style="background: none;">
                    <v-expansion-panel
                        title="Fake expansion panel"
                    />
                </v-expansion-panels>
            </div>

            <div
                class="w-100 "
                id="container"
                ref="inventory-parent"
                :style
            >
                <div
                    class="pa-2 w-100"
                    ref="inside-elem"
                >
                    <!-- Energies table -->
                    <v-row
                        class="w-100 ma-0"
                        style="margin-bottom: 1vh !important"
                    >
                        <v-col
                            v-for="energyType in SUPPORTED_ENERGY_TYPES"
                            :key="energyType"
                            :cols="energyColsSize"
                            class="d-flex justify-center align-center"
                        >
                            <energy :type="energyType">
                                {{ user.data.inventory.energies[energyType] ?? -1 }}
                            </energy>
                        </v-col>
                    </v-row>
                    <v-divider />
                    <inventory
                        :scroll-elem="scrollElem"
                        :items="items"
                        :focus-item-uid="focusedItemUid"
                    >
                        <template v-slot:activator-common-content>
                            <div
                                class="position-absolute h-100 w-100"
                                @click="unfocus()"
                            />
                        </template>
                        <template v-slot:item-common-content="{ item }">
                            <v-btn
                                class="position-absolute close-btn-pos"
                                @click="removeItem(item.uid)"
                                color="error"
                                density="compact"
                                size="small"
                                :icon="`mdi-cross`"
                            >
                                x
                            </v-btn>
                        </template>

                        <template v-slot:item-booster-content="{ booster }">
                            <v-btn
                                class="pa-2 position-absolute"
                                style="top: 75%; left: 50%; transform: translate(-50%, -50%); max-width: 75%;"
                                size="small"
                                @click="user.openBooster(booster.uid)"
                            >
                                Open
                            </v-btn>
                        </template>

                        <template v-slot:item-card-content="{ card }">
                            <v-btn
                                v-if="isCardRecyclable(card)"
                                class="pa-2 position-absolute"
                                style="top: 75%; left: 50%; transform: translate(-50%, -50%); max-width: 75%;"
                                size="small"
                                @click="user.recycleCard(card.uid)"
                            >
                                Recycle
                            </v-btn>
                        </template>
                    </inventory>
                    <v-divider />
                    <inventory
                        :scroll-elem="scrollElem"
                        :items="tradeItems"
                        :focus-item-uid="focusedItemUid"
                    >
                        <template v-slot:activator-common-content>
                            <div
                                class="position-absolute top-0 h-100 w-100 d-flex justify-center align-center"
                                style="pointer-events: none; background-color: rgba(0, 0, 0, 0.25)"
                                @click="unfocus()"
                            >
                                <div
                                    style="color: red; font-weight: 800; font-size: 25px; text-align: center;"
                                >
                                    IN TRADE
                                </div>
                            </div>
                        </template>
                    </inventory>
                </div>
            </div>
            <div ref="last-elem" />
        </div>
    </div>
</template>

<style scoped>
.sticky-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: none;
}
</style>

<style>
.v-col:has(.anchor) {
    padding: 0 !important;
}

/* Custom scrollbar track */
.scrollbar {
  position: absolute;
  top: 0;
  right: 4px;
  width: 6px;
  height: 100%;
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
}

/* Scroll handle */
.scroll-thumb {
  position: absolute;
  top: 0;
  width: 100%;
  height: 60px;
  background: #555;
  border-radius: 10px;
  z-index: 1000;
}

.scroll-container {
  width: 100%;
  overflow-y: scroll;

  /* Hide native scrollbar */
  scrollbar-width: none; /* Firefox */
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

</style>