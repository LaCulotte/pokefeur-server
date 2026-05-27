<script setup lang="ts">
import DealCost from './DealCost.vue';
import Energy from './Energy.vue';
import { user } from '../data/user/vueUserData';
import Inventory from './Inventory.vue';
import LocalScope from './LocalScope.vue';

import { computed, ref, type ComputedRef, type Ref, watch, useTemplateRef, nextTick } from 'vue';
import type { Deal, Payment, InventoryItem, DealCostUnit, ItemPayment } from '../../api/model/interfaces';
import type { Type } from '../../common/constants';
import { currLangData } from '../controller/lang';
import { isCardOfSet, isCardOfType, isCardOfPokemon } from '../../common/checks';
import type { Filters } from '../interfaces';

const props = defineProps<{
    deal: Deal,
    now: number,
    disabled?: boolean
}>();

const renewMessage: ComputedRef<string> = computed(() => {
    if (props.deal.state === "accepted") {
        return "Accepted ...";
    }
    
    const timeRemaining = (props.deal.proposedDate ?? 0) + props.deal.timeoutDuration - props.now;
    if (timeRemaining > 0) {
        return `Renewed in ${timeRemaining}s ...`;
    } else {
        return "Renewing ...";
    }
});

const selectedCostIndex = ref(0);
const focusedItem = ref<string | undefined>(undefined);
const focusTrigger = ref<number>(0);

const payment: Ref<Payment> = ref({
    energies: {},
    items: []
});

const itemUidToPayment: Ref<Record<string, ItemPayment>> = ref({});
const itemBaseToPayments: Ref<Record<string, ItemPayment[]>> = ref({});
watch(payment, (val) => {
    itemUidToPayment.value = {};
    itemBaseToPayments.value = {};
    
    for (const payment of val.items) {
        itemUidToPayment.value[payment.itemUid] = payment;

        const item = user.data.inventory.items[payment.itemUid];
        if (item) {
            itemBaseToPayments.value[item.id] ??= [];
            itemBaseToPayments.value[item.id]?.push(payment);
        }
    }
}, {deep: true});

function darkenActivator(itemId: string, numItems: number): boolean {
    const payments = itemBaseToPayments.value[itemId];
    
    if (selectedCostCompleted.value) {
        return payments?.find((p) => p.costIndex == selectedCostIndex.value) === undefined;
    } else {
        return numItems <= (payments?.length ?? 0);
    }
}

function darkenItem(itemUid: string): boolean {
    const payment = itemUidToPayment.value[itemUid];

    if (selectedCostCompleted.value) {
        return payment !== undefined ? payment.costIndex !== selectedCostIndex.value : true;
    } else {
        return payment !== undefined;
    }
}

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

const selectedCostCompleted = computed(() => {
    return getPaymentFromCost(selectedCostIndex.value) !== undefined;
});

function removeItemPayment(itemUid: string) {
    const index = payment.value.items.findIndex((payment) => { return payment.itemUid == itemUid; });
    if (index > -1) {
        payment.value.items.splice(index, 1);
    }
}

function costClick(_: DealCostUnit, costIndex: number) {
    selectedCostIndex.value = costIndex;

    const itemPayment = getPaymentFromCost(costIndex);
    focusedItem.value = undefined;
    if (itemPayment !== undefined) {
        nextTick(() => { focusedItem.value = itemPayment.itemUid; });
        // triggerRef(focusedItem)
        // focusedItem.value = itemPayment.itemUid;
        // focusTrigger.value ++;
    } else {
        scrollElem.value?.$el.scrollTo({
            top: 0,
            behavior: "auto",
        });
    }
}

const dialogActive = ref(props.deal.cost.items.map(() => false));
function itemClick(item: InventoryItem) {
    const itemPayment = getPaymentFromItem(item.uid);
    if (itemPayment !== undefined) {
        // const index = payment.value.items.findIndex((payment) => { return payment.itemUid == item.uid; });
        // if (index > -1) {
        //     payment.value.items.splice(index, 1);
        // }
        if (selectedCostIndex.value == itemPayment.costIndex) {
            removeItemPayment(item.uid);
        } else {
            selectedCostIndex.value = itemPayment.costIndex;
            focusedItem.value = undefined;
            nextTick(() => { focusedItem.value = item.uid; });
            dialogActive.value.fill(false);
        }
    } else {
        const exitingCost = getPaymentFromCost(selectedCostIndex.value);
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

        dialogActive.value.fill(false);

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

function groupClick(itemId: string) {
    focusedItem.value = undefined;

    if (selectedCostCompleted.value) {
        const paymentItems = itemBaseToPayments.value[itemId];

        const itemToFocus = paymentItems?.find((p) => p.costIndex == selectedCostIndex.value)?.itemUid;
        if (itemToFocus) {
            focusedItem.value = itemToFocus;
        }
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
    payment.value = {
        energies: {},
        items: []
    };
    selectedCostIndex.value = 0;
}

const items = computed(() => Object.values(user.data.inventory.items));

const filters = computed(() => {
    const ret: Partial<Filters>[] = [];

    for (const costUnit of props.deal.cost.items) {
    // const costUnit = props.deal.cost.items[selectedCostIndex.value];
        if (costUnit === undefined) {
            ret.push({itemId: 'none'});
            return ret;
        } else if (costUnit.type == "card" || costUnit.type == "booster") {
            ret.push({
                itemTypes: costUnit.type,
                itemId: costUnit.id,
            });
        } else if (costUnit.type == "card-of-type") {
            ret.push({
                energyType: new Set([costUnit.id]),
                itemTypes: 'card',                
            });
        } else if (costUnit.type == "card-of-set") {
            ret.push({
                sets: new Set([costUnit.id]),
                itemTypes: 'card',                
            });
        } else if (costUnit.type == "card-of-pokemon") {
            ret.push({
                pokemon: new Set([costUnit.id]),
                itemTypes: 'card',
            });
        }
    }

    return ret;
});



const canAccept: ComputedRef<boolean> = computed(() => {
    if (payment.value.items.length != props.deal.cost.items.length) {
        return false;
    }

    for (const [energyType, count] of Object.entries(props.deal.cost.energies)) {
        const payedCount = payment.value.energies[parseInt(energyType) as Type];
        if (payedCount === undefined || payedCount < count) {
            return false;
        }
    }

    return true;
});

const scrollElem = useTemplateRef("scroll-elem");
</script>

<template>
    <div>
        <v-row
            class="h-100 ma-0"
            gap="0"
        >
            <v-col
                cols="8"
                class="h-100 pa-0 position-relative"
                style="overflow: hidden;"
            >
                <div class="h-100 pa-0">
                    <deal-cost
                        :items="deal.cost.items"
                        :energies="deal.cost.energies"
                        style="height: 80%;"
                        class="pt-1 pb-1"
                    />
                    <div class="w-100 pl-2">
                        <span>{{ renewMessage }}</span>
                    </div>
                </div>
                <div class="h-100 w-100 pt-3 pb-3 position-absolute top-0">
                    <div class="h-100 w-100 border-right" />
                </div>
            </v-col>

            <v-col
                cols="4"
                class="pa-4 d-flex flex-column align-center justify-center"
            >
                <div class="section-title">
                    Reward
                </div>
                <div class="reward-title">
                    Booster
                </div>

                <v-dialog
                    class="on-top"
                    transition="slide-y-transition"
                    overlay-transition="slide-y-transition"
                    @after-leave="close()"
                    content-class="deal-proposal-anchor"
                >
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
                    <template v-slot="{ isActive }">
                        <v-sheet
                            color="rgba(255, 255, 255)"
                            class="on-top d-flex flex-column"
                        >
                            <v-sheet>
                                <v-toolbar class="pl-2 pr-2">
                                    <v-btn
                                        variant="outlined"
                                        @click="isActive.value = false;"
                                    >
                                        CLOSE
                                    </v-btn>
                                        
                                    <v-spacer />
                                        
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
                                    @cost-click="costClick"
                                >
                                    <template v-slot:item-cost="{ idx }">
                                        <local-scope
                                            :scope="{ paymentItem: getPaymentFromCost(idx) }"
                                            v-slot="{ paymentItem }"
                                        >
                                            <div
                                                v-if="paymentItem !== undefined"
                                                class="cover d-flex align-center justify-center"
                                            >
                                                <div class="big-green-text">
                                                    {{ paymentItem.costIndex + 1 }}
                                                </div>
                                            </div>
                                            <div
                                                class="cover darken fade"
                                                :class="[paymentItem === undefined ? 'show' : '']"
                                            />
                                            <v-sheet
                                                v-if="idx === selectedCostIndex"
                                                class="cover green-border"
                                                rounded="md"
                                            />
                                        </local-scope>
                                    </template>
                                </deal-cost>

                                <v-divider />
                            </v-sheet>
                            
                            <v-sheet
                                style="overflow: auto;"
                                class="hide-scroll"
                                ref="scroll-elem"
                            >
                                <energy
                                    v-for="(count, type) of deal.cost.energies"
                                    :key="type"
                                    :type="parseInt(type)"
                                    :text_proportion="0.8"
                                    class="pt-2 pb-2 w-100"
                                >
                                    <v-row>
                                        <v-col
                                            cols="2"
                                            class="d-flex justify-begin"
                                        >
                                            {{ (user.data.inventory.energies[parseInt(type) as Type] ?? 0) - (payment.energies[parseInt(type) as Type] ?? 0) }}
                                        </v-col>
                                        <v-col
                                            cols="3"
                                            class="d-flex justify-center"
                                        >
                                            <v-chip
                                                class="h-100"
                                                :disabled="(payment.energies[parseInt(type) as Type] ?? 0) <= 0"
                                                @click="removeEnergy(parseInt(type) as Type)"
                                            >
                                                -
                                            </v-chip>
                                        </v-col>
                                        <v-col
                                            cols="4"
                                            class="d-flex justify-center"
                                        >
                                            {{ payment.energies[parseInt(type) as Type] ?? 0 }} / {{ count! }}
                                        </v-col>
                                        <v-col
                                            cols="3"
                                            class="d-flex justify-center"
                                        >
                                            <v-chip
                                                class="h-100"
                                                :disabled="(payment.energies[parseInt(type) as Type] ?? 0) >= count! || (payment.energies[parseInt(type) as Type] ?? 0) >= (user.data.inventory.energies[parseInt(type) as Type] ?? 0)"
                                                @click="addEnergy(parseInt(type) as Type)"
                                            >
                                                +
                                            </v-chip>
                                        </v-col>
                                    </v-row>
                                </energy>
                                <v-divider v-if="Object.keys(deal.cost.energies).length > 0" />
                                <v-window
                                    v-model="selectedCostIndex"
                                    style="overflow: visible;"
                                >
                                    <v-window-item
                                        v-for="i in deal.cost.items.length"
                                        :key="i"
                                        style="overflow: visible;"
                                    >
                                        <inventory
                                            v-if="scrollElem !== null"
                                            :scroll-elem="scrollElem.$el"
                                            :items="items"
                                            :default-filters="filters[i - 1]"
                                            :focus-item-uid="focusedItem"
                                            dialog-anchor="deal-proposal-dialog"
                                            @item-click="itemClick"
                                            v-model:dialog-active="dialogActive[i - 1]"
                                        >
                                            <template v-slot:activator-common-content="{ item, groupedItems }">
                                                <local-scope
                                                    :scope="{ paymentItems: itemBaseToPayments[item.id] }"
                                                    v-slot="{ paymentItems }"
                                                >
                                                    <div
                                                        class="cover darken fade"
                                                        :class="darkenActivator(item.id, groupedItems.items.length) ? 'show' : ''"
                                                    />

                                                    <v-sheet
                                                        v-if="paymentItems?.find((p) => p.costIndex == selectedCostIndex)"
                                                        class="cover green-border"
                                                        rounded="md"
                                                    />

                                                    <div
                                                        class="cover pa-1"
                                                        @click="groupClick(item.id)"
                                                    >
                                                        <v-chip
                                                            v-for="p in paymentItems?.sort((pa, pb) => pa.costIndex - pb.costIndex)"
                                                            :key="p.costIndex"
                                                            variant="flat"
                                                            color="green"
                                                            class="mr-1"
                                                        >
                                                            {{ p.costIndex + 1 }}
                                                        </v-chip>
                                                    </div>
                                                </local-scope>
                                            </template>
                                            <template v-slot:item-common-content="{ item }">
                                                <local-scope
                                                    :scope="{ paymentItem: itemUidToPayment[item.uid] }"
                                                    v-slot="{ paymentItem }"
                                                >
                                                    <div
                                                        class="cover darken fade"
                                                        :class="darkenItem(item.uid) ? 'show' : ''"
                                                    />

                                                    <div
                                                        v-if="paymentItem"
                                                        class="cover d-flex align-center justify-center"
                                                    >
                                                        <div class="big-green-text">
                                                            {{ paymentItem.costIndex + 1 }}
                                                        </div>
                                                    </div>
                                            
                                                    <v-sheet
                                                        v-if="paymentItem?.costIndex == selectedCostIndex"
                                                        class="position-absolute top-0 w-100 h-100 green-border"
                                                        rounded="md"
                                                    />

                                                    <div
                                                        class="cover"
                                                        v-if="paymentItem !== undefined"
                                                    >
                                                        <v-btn
                                                
                                                            class="position-absolute close-btn-pos"
                                                            @click.stop="removeItemPayment(item.uid)"
                                                            color="error"
                                                            density="compact"
                                                            size="small"
                                                            :icon="`mdi-cross`"
                                                        >
                                                            x
                                                        </v-btn>
                                                    </div>
                                                </local-scope>
                                            </template>
                                        </inventory>

                                        <div v-if="items.length == 0">
                                            No available item :c
                                        </div>
                                    </v-window-item>
                                </v-window>
                            </v-sheet>
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
}

.section-title {
    font-weight: 600;
    font-size: 16px;
}

.reward-title {
    font-weight: 400;
    font-size: 14px;
}

.cover {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    z-index: 10;
}

.green-border {
    background-color: rgba(0,0,0,0);
    border: solid 3px rgb(56, 175, 60);
}

.big-green-text {
    color: rgb(56, 175, 60); 
    font-family: 'Courier New', Courier, monospace; 
    font-weight: 1000; 
    font-size: 100px;
}

.fade {
  opacity: 0;
  transition: opacity 300ms ease;
  will-change: opacity;
}

.fade.show {
  opacity: 1;
}

.darken {
    background-color: rgba(0, 0, 0, 0.5);
}

.on-top > :deep(.v-overlay__content) {
    position: absolute;
    top: 0;
}

:deep(.deal-proposal-anchor) {
    anchor-name: --deal-proposal-dialog;
}
</style>