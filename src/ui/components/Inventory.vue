<script setup lang="ts">
import { computed, ref } from 'vue';
import { user } from '../data/user/vueUserData';
import Item from './Item.vue';
import { useDisplay } from 'vuetify'

const { xlAndUp, lgAndUp, smAndDown } = useDisplay()
const colsSize = computed(() => {
    return xlAndUp.value ? 2
        : lgAndUp.value ? 2
        : smAndDown.value ? 4
        : 3
})

</script>

<template>
    <div>
        <v-row class="h-100 w-100 align-content-start ma-0">
            <v-col
            v-for="[i, obj] of Object.values(user.data.inventory).entries()"
            :cols="colsSize"
            class="w-100 d-flex justify-center align-center"
            style="max-height: 30%; padding: 4px;"
            :key="obj.uid"
            >
                <item :item="obj" :key="obj.uid">
                    <template v-slot:common-content="{ item }">
                        <v-btn
                        class="position-absolute close-btn-pos"
                        @click="user.removeItem(item.uid)"
                        color="error"
                        density="compact"
                        size="small"
                        :icon="`mdi-cross`"
                        >
                            x
                        </v-btn>
                    </template>

                    <template v-slot:booster-content="{ booster }">
                        <v-btn 
                        class="pa-2 position-absolute"
                        style="top: 75%; left: 50%; transform: translate(-50%, -50%);"
                        @click="user.openBooster(booster.uid)">
                            Open
                        </v-btn>
                    </template>
                </item>
            </v-col>
        </v-row>
    </div>
</template>

<style lang="css">
/** Item aspect ratio is 245:337 */

.close-btn-pos {
    --pos: 2%;
    left: var(--pos); 
    top: calc(var(--pos) * 245 / 337)
}
</style>