<script setup lang="ts">
import UserAvatar from '../users/UserAvatar.vue';
import type { InventoryItem, PublicUser } from '../../../api/model/interfaces';
import { computed, nextTick, ref, useTemplateRef, withModifiers, type Ref } from 'vue';
import Inventory from '../Inventory.vue';
import Badge from '../Badge.vue';
import { user } from '../../data/user/vueUserData.ts';
import type { GroupedItems } from '@/ui/interfaces.js';
import ItemGrid from '../ItemGrid.vue';
import BaseItemComponent from '../item/BaseItemComponent.vue';

const props = defineProps<{
    sideUser: PublicUser,
    alreadySelected?: InventoryItem[]
}>();

const emit = defineEmits<{
    selected: [InventoryItem[]]
}>();

const focusedItemUid = ref<string | undefined>();
const menuSelectedActive = ref<boolean>(false);

const selectedItems = ref<InventoryItem[]>([]);
const selectedSet = computed(() => {
    let selectedIds = selectedItems.value.map(i => i.uid);
    selectedIds = selectedIds.concat(props.alreadySelected?.map(i => i.uid) ?? []);
    return new Set(selectedIds);
});

function focusSelection(item: InventoryItem) {
    focusedItemUid.value = undefined;
    nextTick(() => focusedItemUid.value = item.uid);
}

function select(item: InventoryItem) {
    const itemIndex = selectedItems.value.findIndex((i) => i.uid == item.uid);
    if (itemIndex != -1) {
        selectedItems.value.splice(itemIndex, 1);
    } else {
        selectedItems.value.push(item);
    }
}


function getSelectedCount(items: GroupedItems<InventoryItem>) {
    // if (!selectedItems.value.find((i) => i.id == items.base.id)) {
    //     return 0;
    // }

    return items.items.filter((i) => selectedSet.value.has(i.uid)).length;
}

const scrollElem = useTemplateRef('scrollElem');
const selectedScrollElem = useTemplateRef('selectedScrollElem');
</script>

<template>
    <div class="h-100 overflow-auto d-flex flex-column">
        <v-sheet
            class="position-sticky top-0 pt-2 border-b-sm"
            style="z-index: 10"
        >
            <v-row class="justify-center">
                <v-col cols="auto">
                    <user-avatar
                        :username="sideUser.username"
                        :size="40"
                    />
                </v-col>
                <v-col
                    class="d-flex align-center text-body-large"
                    cols="auto"
                >
                    Inventory of {{ sideUser.username }} {{ sideUser.uid == user.data.uid ? '(you)' : '' }}
                </v-col>
                <div
                    class="position-absolute left-0"
                    style="top: 5px"
                >
                    <v-btn
                        variant="text"
                        icon="mdi-arrow-left"
                        @click="emit('selected', [])"
                    />
                </div>
            </v-row>
            <v-row gap="10">
                <v-menu
                    v-model="menuSelectedActive"
                    location="bottom"
                    class="left-0"
                    stick-to-target
                >
                    <template v-slot:activator="{ props: activatorProps }">
                        <v-col class="ma-1">
                            <v-btn
                                v-bind="activatorProps"
                                class="w-100"
                                elevation="1"
                            >
                                {{ selectedItems.length }} item(s) selected
                            </v-btn>
                        </v-col>
                    </template>
                    <v-sheet
                        class="border-sm"
                        style="max-height: 50vh; border-color: black;"
                    >
                        <div
                            ref="selectedScrollElem"
                            class="pa-1 h-100 overflow-auto"
                        >
                            <div v-if="selectedItems.length == 0">
                                No item selected :c
                            </div>
                            <item-grid
                                class="w-100"
                                :item-count="selectedItems.length"
                                :min-item-height-ratio="0.17"
                                :max-item-height-ratio="0.2"
                                :scroll-elem="selectedScrollElem"
                            >
                                <template v-slot="{ i }">
                                    <base-item-component
                                        :item="selectedItems[i]!"
                                        @click="focusSelection(selectedItems[i]!)"
                                    />
                                </template>
                            </item-grid>
                        </div>
                    </v-sheet>
                </v-menu>
            </v-row>
        </v-sheet>

        <div
            class="overflow-auto"
            ref="scrollElem"
        >
            <v-container
                fluid
                class="pt-0"
            >
                <inventory
                    :items="Object.values(sideUser.inventory.items)"
                    :scroll-elem="scrollElem"
                    :="menuSelectedActive ? {onClickCapture: withModifiers(() => {}, ['stop'])} : {}"
                    :focus-item-uid="focusedItemUid"
                >
                    <template v-slot:activator-common-content="{ groupedItems }">
                        <div class="cover pa-1">
                            <badge
                                v-if="getSelectedCount(groupedItems)"
                                class="text-label-small"
                                style="background-color: green;"
                            >
                                {{ getSelectedCount(groupedItems) }}
                            </badge>
                        </div>
                    </template>
                    <template v-slot:item-common-content="{ item }">
                        <div
                            class="cover fade"
                            :class="selectedSet.has(item.uid) ? 'show' : ''"
                            style="background-color: rgb(0, 0, 0, 0.5); border: solid 3px rgb(56, 175, 60); z-index: 0"
                        />
                        <div
                            v-if="!alreadySelected?.find((i) => i.uid == item.uid)"
                            class="cover"
                            @click="select(item)"
                        />
                    </template>
                </inventory>
            </v-container>


            <!-- class="position-sticky bottom-0 pb-0" -->
            <v-container
                class="position-sticky bottom-0"
                style="z-index: 10"
            >
                <!-- class="pa-2 border-s-sm border-e-sm border-t-sm rounded-ts rounded-te" -->
                <v-sheet
                    class="pa-2 border-sm rounded"
                    style="z-index: 10"
                >
                    <v-row>
                        <v-col>
                            <v-btn
                                class="w-100"
                                color="success"
                                :disabled="selectedItems.length == 0"
                                @click="emit('selected', selectedItems)"
                            >
                                select
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-sheet>
            </v-container>
        </div>
    </div>
</template>

<style scoped>
.cover {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    z-index: 10;
}

.center-content {
    display: flex;
    align-items: center;
    justify-content: center;
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