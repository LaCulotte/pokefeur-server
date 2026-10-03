<script setup lang="ts">
import type { InventoryItem, TradeProposal } from '@/api/model/interfaces';
import TradeProposalDisplaySide from '../../components/trades/TradeProposalDisplaySide.vue';
import { ref, type Ref } from 'vue';
import ItemSelect from './ItemSelect.vue';
import { user } from '../../data/user/vueUserData.ts';
import type { PublicUser } from '../../../api/model/interfaces';


const props = defineProps<{
    edit?: boolean
}>();

const proposal = defineModel<TradeProposal>({ required: true });

async function fetchUser(userUid: string) : Promise<PublicUser | undefined> {
    if (userUid == user.data.uid) {
        return user.data;
    }

    const response = await fetch("/api/getPublicUser?" + new URLSearchParams({ userUid: userUid }).toString());

    if (!response.ok) {
        return;
    }

    const data = await response.json();
    return data.user;
};

const addingItemsSide = ref<'to' | 'from' | undefined>(undefined);
const addingItemsUser: Ref<PublicUser | undefined> = ref(undefined);
const addingItemsLoading = ref(false);

async function addItems(side: 'to' | 'from') {
    addingItemsSide.value = side;
    addingItemsLoading.value = true;
    addingItemsUser.value = await fetchUser(proposal.value[side].uid);

    if (addingItemsUser.value === undefined) {
        console.error("Could not get user !");
    }
    addingItemsLoading.value = false;
}

function selected(items: InventoryItem[]) {
    if (!addingItemsSide.value) {
        return;
    }
    
    proposal.value[addingItemsSide.value].items = proposal.value[addingItemsSide.value].items.concat(items);
    
    addingItemsSide.value = undefined;
    setTimeout(() => addingItemsUser.value = undefined, 200);
}

// fetchUser(props.userUid).then((val) => sideUser.value = val);

function removeItem(side: 'to' | 'from', itemUid: string) {
    const itemIndex = proposal.value[side].items.findIndex((i) => i.uid == itemUid);

    if (itemIndex == -1) {
        console.error(`Cannot remove item of uid ${itemUid} from side ${side} because it is not present`);
        return;
    }

    proposal.value[side].items.splice(itemIndex, 1);
}
</script>

<template>
    <v-progress-linear
        indeterminate
        color="green"
        :active="addingItemsLoading"
    />
    <v-window
        :model-value="(addingItemsUser && addingItemsSide) ? 1 : 0"
        class="h-100"
    >
        <v-window-item class="h-100 overflow-auto">
            <slot name="header" />
            <v-container class="w-100">
                <trade-proposal-display-side
                    :side="proposal.from"
                    :edit="edit"
                    @add-items="addItems('from')"
                    @remove-item="(itemUid: string) => removeItem('from', itemUid)"
                />
                <v-row :gap="[10, 10]">
                    <v-col class="d-flex align-center">
                        <v-divider />
                    </v-col>
                    <v-col cols="auto">
                        <v-icon
                            icon="mdi-swap-vertical"
                            size="small"
                        />
                    </v-col>
                    <v-col class="d-flex align-center">
                        <v-divider />
                    </v-col>
                </v-row>
                <trade-proposal-display-side
                    :side="proposal.to"
                    :edit="edit"
                    @add-items="addItems('to')"
                    @remove-item="(itemUid: string) => removeItem('to', itemUid)"
                />
            </v-container>
            <slot />
        </v-window-item>
        <v-window-item class="h-100 overflow-auto">
            <item-select
                v-if="addingItemsUser"
                :side-user="addingItemsUser"
                :already-selected="proposal[addingItemsSide!]?.items ?? []"
                @selected="selected"
            />
        </v-window-item>
    </v-window>
</template>
