<script setup lang="ts">
import DealCost from './DealCost.vue';
import Energy from './Energy.vue';
import { user } from '../data/user/vueUserData';
import ItemGrid from './ItemGrid.vue';

import { computed, onMounted, ref, type ComputedRef, type Ref, watch, useTemplateRef } from 'vue';
import type { Deal, Payment, InventoryItem } from '../../api/model/interfaces';
import { recycleCards } from '../../api/controller/energy';
import type { Type } from '../../common/constants';

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

const payment: Ref<Payment> = ref({
    energies: {},
    items: []
});

let selectedItemIds: Ref<Array<string>> = ref([]);

function select(item: InventoryItem) {
    if (payment.value.items.includes(item.uid)) {
        return;
    }

    selectedItemIds.value.push(item.id);
    payment.value.items.push(item.uid);
}

function unselect(item: InventoryItem) {
    const index = selectedItemIds.value.indexOf(item.id);
    if (index > -1) {
        selectedItemIds.value.splice(index, 1);
    }

    const paymentIndex = payment.value.items.indexOf(item.uid);
    if (paymentIndex > -1) {
        payment.value.items.splice(paymentIndex, 1);
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
    selectedItemIds.value = [];
    payment.value = {
        energies: {},
        items: []
    }
}

const displayInventory = computed(() => {
    return Object.values(user.data.inventory.items).filter((item) => {
        return props.deal.cost.find((costUnit) => {
            return costUnit.id == item.id;
        }) !== undefined;
    });
});

const remaningCost = computed(() => {
    let clonedSelectedItemIds = [...selectedItemIds.value];
    let ret = props.deal.cost.filter((cost) => {
        if (cost.type === "energy") {
            return (payment.value.energies[cost.id] ?? 0) < cost.count;
        } else {
            let costIndex = clonedSelectedItemIds.findIndex((itemId) => { return itemId == cost.id; });
            if (costIndex === -1)
                return true;

            clonedSelectedItemIds.splice(costIndex, 1);
            return false;
        }
    });

    return ret;
});

const selectableInventoryUids = computed(() => {
    let ret = displayInventory.value.filter((item) => {
        return remaningCost.value.find((costUnit) => {
            return costUnit.id == item.id;
        }) !== undefined;
    }).map((item) => { return item.uid; });

    return ret;
});

let scrollElem = useTemplateRef("scroll-elem");
// console.log(scrollElem.value?.$el)
</script>

<template>
    <div>
        <v-row class="h-100 ma-0">
            <v-col cols="8" class="h-100 pa-0 position-relative" style="overflow: hidden;">
                <div class="h-100 pa-0">
                    <deal-cost
                        :deal-cost="deal.cost"
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
                transition="slide-y-transition"
                overlay-transition="slide-y-transition">
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
                        style="height: 100%;"
                        ref="scroll-elem"
                        >
                            <!-- <div style="overflow: auto;" ref="scroll-elem" class="h-100 w-100 ">
                            <div  class="h-100 w-100"> -->
                                <v-sheet class="sticky-header" color="white">
                                    <div></div>
                                    <v-toolbar class="pl-2 pr-2">
                                        <v-btn
                                        variant="outlined"
                                        @click="isActive.value = false; close()"
                                        >
                                            CLOSE
                                        </v-btn>
                                        
                                        <v-spacer></v-spacer>
                                        
                                        <v-btn
                                        color="success"
                                        variant="flat"
                                        :disabled="remaningCost.length !== 0"
                                        @click="user.acceptDeal(props.deal.uid, payment);"
                                        >
                                            ACCEPT
                                        </v-btn>
                                    </v-toolbar>
                                    
                                    <deal-cost
                                    :deal-cost="deal.cost.filter((c) => { return c.type !== 'energy'; })"
                                    :selected-items="selectedItemIds"
                                    class="pa-3"
                                    style="max-height: 30vh;"
                                    ></deal-cost>

                                    <v-divider/>
                                </v-sheet>
                            
                                <v-sheet style="overflow: auto;">
                                    <energy
                                    v-for="e in deal.cost.filter((c) => { return c.type == 'energy'; })"
                                    :type="e.id"
                                    :text_proportion="0.8"
                                    class="pt-2 pb-2 w-100"
                                    >
                                        <v-row>
                                            <v-col cols="2" class="d-flex justify-begin">
                                                {{ (user.data.inventory.energies[e.id] ?? 0) - (payment.energies[e.id] ?? 0)}}
                                            </v-col>
                                            <v-col cols="3" class="d-flex justify-center">
                                                <v-chip
                                                class="h-100"
                                                :disabled="(payment.energies[e.id] ?? 0) <= 0"
                                                @click="removeEnergy(e.id)">-</v-chip>
                                            </v-col>
                                            <v-col cols="4" class="d-flex justify-center">
                                                {{ payment.energies[e.id] ?? 0 }} / {{ e.count }}
                                            </v-col>
                                            <v-col cols="3" class="d-flex justify-center">
                                                <v-chip
                                                class="h-100"
                                                :disabled="(payment.energies[e.id] ?? 0) >= e.count || (payment.energies[e.id] ?? 0) >= (user.data.inventory.energies[e.id] ?? 0)"
                                                @click="addEnergy(e.id)">+</v-chip>
                                            </v-col>
                                        </v-row>
                                    </energy>

                                    <item-grid
                                    v-if="scrollElem !== null"
                                    :items="displayInventory"
                                    :max-item-height-ratio="0.2"
                                    :min-item-height-ratio="0.2"
                                    :scroll-elem="scrollElem?.$el"
                                    compact
                                    >
                                        <template v-slot:common-content="{ item }">
                                            <div
                                            class="position-absolute top-0 w-100 h-100 fade"
                                            :class="[!selectableInventoryUids.includes(item.uid) && !payment.items.includes(item.uid) ? 'show' : '']"
                                            style="background-color: rgba(0, 0, 0, 0.5);"></div>

                                            <v-sheet
                                            v-if="payment.items.includes(item.uid)"
                                            class="position-absolute top-0 w-100 h-100"
                                            color="rgba(0,0,0,0)"
                                            style="border: solid 3px rgb(56, 175, 60);"
                                            rounded="md"
                                            @click="unselect(item)"></v-sheet>

                                            <div
                                            v-else-if="selectableInventoryUids.includes(item.uid)"
                                            class="position-absolute top-0 w-100 h-100"
                                            style="background-color: rgba(0, 0, 0, 0.0);"
                                            @click="select(item)"></div>
                                        </template>
                                    </item-grid>
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

<style scoped>
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
</style>