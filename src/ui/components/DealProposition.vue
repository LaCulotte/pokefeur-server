<script setup lang="ts">
import DealCost from './DealCost.vue';
import Energy from './Energy.vue';
import { user } from '../data/user/vueUserData';
import ItemGrid from './ItemGrid.vue';
import LocalScope from './LocalScope.vue';

import { computed, onMounted, ref, type ComputedRef, type Ref, watch, useTemplateRef } from 'vue';
import type { Deal, Payment, InventoryItem, DealCostUnit, ItemPayment } from '../../api/model/interfaces';
import { recycleCards } from '../../api/controller/energy';
import type { Type } from '../../common/constants';
import { currLangData } from '../controller/lang';
import { isCardOfSet, isCardOfType } from '../../common/checks';

const props = defineProps<{
    deal: Deal,
    now: number,
    disabled?: boolean
}>();

const renewMessage: ComputedRef<string> = computed(() => {
    if (props.deal.state === "accepted") {
        return "Accepted ...";
    }
    
    let timeRemaining = (props.deal.proposedDate ?? 0) + props.deal.timeoutDuration - props.now;
    if (timeRemaining > 0) {
        return `Renewed in ${timeRemaining}s ...`
    } else {
        return "Renewing ..."
    }
});

const selectedCostIndex = ref(0);

const payment: Ref<Payment> = ref({
    energies: {},
    items: []
});

function getPaymentFromCost(costIndex: number): ItemPayment | undefined {
    return payment.value.items.find((payment) => {
        return payment.costIndex == costIndex;
    });
}

function getPaymentFromItem(itemUid: string): ItemPayment | undefined {
    return payment.value.items.find((payment) => {
        return payment.itemUid == itemUid;
    });
}

const currentCostCompleted = computed(() => {
    return getPaymentFromCost(selectedCostIndex.value) !== undefined;
});

function removeItemPayment(itemUid: string) {
    const index = payment.value.items.findIndex((payment) => { return payment.itemUid == itemUid; });
    if (index > -1) {
        payment.value.items.splice(index, 1);
    }
}

function itemClick(item: InventoryItem) {
    let itemPayment = getPaymentFromItem(item.uid)
    if (itemPayment !== undefined) {
        // const index = payment.value.items.findIndex((payment) => { return payment.itemUid == item.uid; });
        // if (index > -1) {
        //     payment.value.items.splice(index, 1);
        // }
        if (selectedCostIndex.value == itemPayment.costIndex) {
            removeItemPayment(item.uid)
        } else {
            selectedCostIndex.value = itemPayment.costIndex;
        }
    } else {
        let exitingCost = getPaymentFromCost(selectedCostIndex.value);
        if (exitingCost !== undefined) {
            const index = payment.value.items.findIndex((payment) => { return payment.itemUid == exitingCost.itemUid; });
            if (index > -1) {
                payment.value.items.splice(index, 1);
            }
        }

        payment.value.items.push({
            costIndex: selectedCostIndex.value,
            itemUid: item.uid
        });

        // let currSelectedCostIndex = selectedCostIndex.value;
    
        // setTimeout(() => {
        //     if (currSelectedCostIndex != selectedCostIndex.value) {
        //         return;
        //     }

        //     if (selectedCostIndex.value + 1 < props.deal.cost.items.length) {
        //         selectedCostIndex.value ++;
        //     }
        // }, 200);
    }
}

function addEnergy(energyType: Type) {
    if (payment.value.energies[energyType] === undefined) {
        payment.value.energies[energyType] = 0;
    }

    if (payment.value.energies[energyType] >= (user.data.inventory.energies[energyType] ?? 0)) {
        return;
    }

    payment.value.energies[energyType] += 1;
}

function removeEnergy(energyType: Type) {
    if (payment.value.energies[energyType] === undefined) {
        payment.value.energies[energyType] = 0;
        return;
    }

    payment.value.energies[energyType] -= 1;
}

function close() {
    // selectedItemIds.value = [];
    payment.value = {
        energies: {},
        items: []
    }
    selectedCostIndex.value = 0;
}

const displayInventory: ComputedRef<Array<InventoryItem>> = computed(() => {
    let costUnit = props.deal.cost.items[selectedCostIndex.value];
    if (costUnit === undefined) {
        return [];
    }

    let filter: (item: InventoryItem) => boolean = () => { return false; };

    if (costUnit.type == "card" || costUnit.type == "booster") {
        filter = (item: InventoryItem) => {
            // TODO : use true centralized filters (the same for both backend and frontend)
            return item.id == costUnit.id;
        };
    } else if (costUnit.type == "card-of-type") {
        const staticData = currLangData.value;
        if (staticData !== undefined) {
            filter = (item) => {
                return isCardOfType(staticData, item.id, costUnit.id);
            }
        }
    } else if (costUnit.type == "card-of-set") {
        const staticData = currLangData.value;
        if (staticData !== undefined) {
            filter = (item) => {
                return isCardOfSet(staticData, item.id, costUnit.id);
            }
        }
    }

    return Object.values(user.data.inventory.items).filter(filter);
});

const canAccept: ComputedRef<boolean> = computed(() => {
    if (payment.value.items.length != props.deal.cost.items.length) {
        return false;
    }

    for (let [energyType, count] of Object.entries(props.deal.cost.energies)) {
        let payedCount = payment.value.energies[parseInt(energyType) as Type];
        if (payedCount === undefined || payedCount < count) {
            return false;
        }
    }

    return true;
});

let scrollElem = useTemplateRef("scroll-elem");
</script>

<template>
    <div>
        <v-row class="h-100 ma-0">
            <v-col cols="8" class="h-100 pa-0 position-relative" style="overflow: hidden;">
                <div class="h-100 pa-0">
                    <deal-cost
                        :items="deal.cost.items"
                        :energies="deal.cost.energies"
                        style="height: 80%;"
                        class="pt-1 pb-1"
                    >
                    </deal-cost>
                    <div class="w-100 pl-2">
                        <span>{{ renewMessage }}</span>
                    </div>
                </div>
                <div class="h-100 w-100 pt-3 pb-3 position-absolute top-0">
                    <div class="h-100 w-100 border-right"></div>
                </div>
            </v-col>

            <v-col cols="4" class="pa-4 d-flex flex-column align-center justify-center">
                <div class="section-title">Reward</div>
                <div class="reward-title">Booster</div>

                <v-dialog
                class="on-top"
                transition="slide-y-transition"
                overlay-transition="slide-y-transition"
                @after-leave="close()">
                    <template v-slot:activator="{ props: activatorProps }">
                        <v-btn
                        v-if="!disabled"
                        v-bind="activatorProps"
                        color="success"
                        class="mt-3"
                        density="compact"
                        >
                            ACCEPT
                        </v-btn>
                        <v-btn
                        v-else
                        variant="outlined"
                        :ripple="false"
                        color="black"
                        class="mt-3"
                        density="compact" 
                        >
                            RENEWING
                        </v-btn>
                    </template>
                    <template v-slot:default="{ isActive }">
                        <v-sheet
                        color="rgba(255, 255, 255)"
                        class="on-top"
                        ref="scroll-elem"
                        >
                            <!-- <div style="overflow: auto;" ref="scroll-elem" class="h-100 w-100 ">
                            <div  class="h-100 w-100"> -->
                                <v-sheet class="sticky-header" color="white">
                                    <v-toolbar class="pl-2 pr-2">
                                        <v-btn
                                        variant="outlined"
                                        @click="isActive.value = false;"
                                        >
                                            CLOSE
                                        </v-btn>
                                        
                                        <v-spacer></v-spacer>
                                        
                                        <v-btn
                                        color="success"
                                        variant="flat"
                                        :disabled="!canAccept"
                                        @click="user.acceptDeal(props.deal.uid, payment);"
                                        >
                                            ACCEPT
                                        </v-btn>
                                    </v-toolbar>
                                    
                                    <!-- :deal-cost="deal.cost.filter((c) => { return c.type !== 'energy'; })" -->
                                    <deal-cost
                                    :items="deal.cost.items"
                                    :selected-items="[]"
                                    class="pa-3"
                                    style="max-height: 30vh;"
                                    @cost-click="(_, i) => { selectedCostIndex = i; }"
                                    >
                                        <template v-slot:item-cost="{cost, idx}">
                                            <local-scope
                                            :paymentItem="getPaymentFromCost(idx)"
                                            v-slot="{paymentItem}"
                                            >
                                                <v-sheet
                                                v-if="paymentItem !== undefined"
                                                class="position-absolute top-0 w-100 h-100 d-flex align-center justify-center"
                                                color="rgba(0,0,0,0)"
                                                >
                                                    <div
                                                    style="color: rgb(56, 175, 60); font-family: 'Courier New', Courier, monospace; font-weight: 1000; font-size: 100px;"
                                                    >
                                                        {{ paymentItem.costIndex + 1 }}
                                                    </div>
                                                </v-sheet>
                                                <div
                                                class="position-absolute top-0 w-100 h-100 fade"
                                                :class="[paymentItem === undefined ? 'show' : '']"
                                                style="background-color: rgba(0, 0, 0, 0.5);">
                                                </div>
                                                <v-sheet
                                                v-if="idx === selectedCostIndex"
                                                class="position-absolute top-0 w-100 h-100"
                                                color="rgba(0,0,0,0)"
                                                style="border: solid 3px rgb(56, 175, 60);"
                                                rounded="md"
                                                ></v-sheet>
                                            </local-scope>
                                        </template>
                                    </deal-cost>

                                    <v-divider/>
                                </v-sheet>
                            
                                <v-sheet style="overflow: auto;">
                                    <energy
                                    v-for="(count, type) of deal.cost.energies"
                                    :type="parseInt(type)"
                                    :text_proportion="0.8"
                                    class="pt-2 pb-2 w-100"
                                    >
                                        <v-row>
                                            <v-col cols="2" class="d-flex justify-begin">
                                                {{ (user.data.inventory.energies[parseInt(type) as Type] ?? 0) - (payment.energies[parseInt(type) as Type] ?? 0)}}
                                            </v-col>
                                            <v-col cols="3" class="d-flex justify-center">
                                                <v-chip
                                                class="h-100"
                                                :disabled="(payment.energies[parseInt(type) as Type] ?? 0) <= 0"
                                                @click="removeEnergy(parseInt(type) as Type)">-</v-chip>
                                            </v-col>
                                            <v-col cols="4" class="d-flex justify-center">
                                                {{ payment.energies[parseInt(type) as Type] ?? 0 }} / {{ count! }}
                                            </v-col>
                                            <v-col cols="3" class="d-flex justify-center">
                                                <v-chip
                                                class="h-100"
                                                :disabled="(payment.energies[parseInt(type) as Type] ?? 0) >= count! || (payment.energies[parseInt(type) as Type] ?? 0) >= (user.data.inventory.energies[parseInt(type) as Type] ?? 0)"
                                                @click="addEnergy(parseInt(type) as Type)">+</v-chip>
                                            </v-col>
                                        </v-row>
                                    </energy>
                                    <v-divider/>

                                    <item-grid
                                    v-if="scrollElem !== null"
                                    :items="displayInventory"
                                    :max-item-height-ratio="0.2"
                                    :min-item-height-ratio="0.2"
                                    :scroll-elem="scrollElem?.$el"
                                    compact
                                    @item-click="itemClick"
                                    >
                                        <template v-slot:common-content="{ item }">
                                            <local-scope
                                            :paymentItem="getPaymentFromItem(item.uid)"
                                            v-slot="{paymentItem}"
                                            >
                                                <div
                                                class="position-absolute top-0 w-100 h-100 fade"
                                                :class="[(currentCostCompleted && paymentItem?.costIndex != selectedCostIndex) || (paymentItem !== undefined && paymentItem?.costIndex != selectedCostIndex) ? 'show' : '']"
                                                style="background-color: rgba(0, 0, 0, 0.5);"></div>
                                                
                                                <v-sheet
                                                v-if="paymentItem?.costIndex == selectedCostIndex"
                                                class="position-absolute top-0 w-100 h-100"
                                                color="rgba(0,0,0,0)"
                                                style="border: solid 3px rgb(56, 175, 60);"
                                                rounded="md"
                                                ></v-sheet>

                                                <v-sheet
                                                v-if="paymentItem !== undefined"
                                                class="position-absolute top-0 w-100 h-100 d-flex align-center justify-center"
                                                color="rgba(0,0,0,0)"
                                                >
                                                    <div
                                                    style="color: rgb(56, 175, 60); font-family: 'Courier New', Courier, monospace; font-weight: 1000; font-size: 100px;"
                                                    >
                                                        {{ paymentItem.costIndex + 1 }}
                                                    </div>
                                                </v-sheet>

                                                <v-btn
                                                v-if="paymentItem !== undefined"
                                                class="position-absolute close-btn-pos"
                                                @click.stop="removeItemPayment(item.uid)"
                                                color="error"
                                                density="compact"
                                                size="small"
                                                :icon="`mdi-cross`"
                                                >
                                                    x
                                                </v-btn>
                                            </local-scope>

                                        </template>
                                    </item-grid>

                                    <div v-if="displayInventory.length == 0">
                                        No available item :c
                                    </div>
                                </v-sheet>
                            <!-- </div> -->
                            <!-- </div> -->
                        </v-sheet>
                    </template>
                </v-dialog>
            </v-col>
        </v-row>
    </div>
</template>

<style>
.sticky-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: none;
}

.section-title {
    font-weight: 600;
    font-size: 16px;
}

.reward-title {
    font-weight: 400;
    font-size: 14px;
}

.fade {
  opacity: 0;
  transition: opacity 300ms ease;
  will-change: opacity;
}

.fade.show {
  opacity: 1;
}

.on-top > .v-overlay__content {
    position: absolute;
    top: 0;
}
</style>