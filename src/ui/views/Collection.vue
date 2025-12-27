<script setup lang="ts">
import AdminDashboard from "../components/AdminDashboard.vue";
import Inventory from "../components/Inventory.vue"
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

        <div class="position-absolute d-flex flex-column top-0 w-100 h-100 inventory-scroll">
            <div class="sticky-header pa-2" style="z-index: -10; visibility: hidden;">
                <v-expansion-panels style="background: none;">
                    <v-expansion-panel
                        title="Fake expansion panel"
                        text=""
                    >
                    </v-expansion-panel>
                </v-expansion-panels>
            </div>

            <div class="pa-3 w-100">
                <inventory class="h-screen"></inventory>
            </div>
        </div>
    </div>
</template>

<style>
.sticky-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: none;
}

.inventory-scroll {
    flex: 1 1 auto;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.inventory-scroll::-webkit-scrollbar {
  display: none;
}
</style>
