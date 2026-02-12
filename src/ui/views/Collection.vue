<script setup lang="ts">
import AdminDashboard from "../components/AdminDashboard.vue";
import Inventory from "../components/Inventory.vue"

import { useRouter } from 'vue-router'
import { onMounted, onUnmounted, useTemplateRef, ref } from 'vue'

document.title = "Collection";

const router = useRouter()

function goToDealership() {
    router.push("/dealership")
}

const lastElem = useTemplateRef("last-elem");
const scrollElem = useTemplateRef("scroll-inventory");
const resizedElem = useTemplateRef("inventory-parent");
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

onMounted(() => {
    if (!!scrollElem.value) {
        scrollElem.value.addEventListener("scroll", scrollBehaviour);
    } else {
        document.addEventListener("scroll", scrollBehaviour);
    }
    scrollBehaviour();
});

onUnmounted(() => {
    if (!!scrollElem.value) {
        scrollElem.value.removeEventListener("scroll", scrollBehaviour);
    } else {
        document.removeEventListener("scroll", scrollBehaviour);
    }
});
</script>

<template>
    <div>
        <div class="sticky-header pa-2">
            <v-expansion-panels style="background: none;">
                <v-expansion-panel
                    title="Admin"
                >
                    <v-expansion-panel-text>
                        <admin-dashboard></admin-dashboard>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </div>

        <div class="position-absolute top-0 w-100 h-screen">
            <div class="position-absolute bottom-0 pa-5" style="z-index: 20;">
                <v-btn class="collection-btn" rounded="xl" icon="mdi-currency-usd" @click="goToDealership"></v-btn>
            </div>
        </div>

        <div class="position-absolute d-flex flex-column top-0 w-100 h-100 inventory-scroll" ref="scroll-inventory" id="scroll-inventory"
        style="background-color: rgba(95, 158, 160, 0.4); overflow: auto;"
        >
            <div class="sticky-header pa-2" style="z-index: -10; visibility: hidden;">
                <v-expansion-panels style="background: none;">
                    <v-expansion-panel
                        title="Fake expansion panel"
                        text=""
                    >
                    </v-expansion-panel>
                </v-expansion-panels>
            </div>

            <div
            class="w-100"
            ref="inventory-parent"
            :style="lockedHeight > 0 ? `min-height: ${lockedHeight}px;` : ''"
            >
                <div
                class="pa-3 w-100"
                ref="inside-elem"
                >
                    <inventory 
                    :max-item-height="'30vh'"
                    :scroll-elem="scrollElem"
                    >
                    </inventory>
                </div>
                <!-- <div
                style="background-color: rgba(95, 158, 160, 0.4);"
                :style="paddingHeight > 0 ? `min-height: ${paddingHeight}px;` : ''"
                >
                </div> -->
                
                <!-- <div>salut</div> -->
            </div>
            <div ref="last-elem"></div>
        </div>
    </div>
</template>

<style scoped>
/* .html{
    background-color: rgba(95, 158, 160, 0.4);
} */

.sticky-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: none;
}

.inventory-scroll {
    /* flex: 1 1 auto; */
    /* -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none; */
}

/* .inventory-scroll::-webkit-scrollbar {
  display: none;
} */


/* .fade.show {
  opacity: 1;
} */
</style>

<style>
.v-col:has(.anchor) {
    padding: 0 !important;
}
</style>