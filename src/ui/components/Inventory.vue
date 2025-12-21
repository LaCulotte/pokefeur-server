<script setup lang="ts">
import { computed, ref } from 'vue';
import { user } from '../data/user/vueUserData';
import type { ItemType } from '@/api/data/interfaces';
import Card from './Card.vue';
import Booster from './Booster.vue';
import Item from './Item.vue';
  import { useDisplay } from 'vuetify'

const type = ref("card");
const id = ref("")

const counts = computed(() => {
    let count = {
        cards: 0,
        boosters: 0
    }

    Object.values(user.data.inventory).forEach((item) => {
        if (item.type == "booster")
            count.boosters ++
        else
            count.cards ++
    });

    return count;
});

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
                <item :item="obj" :key="obj.uid"></item>
            </v-col>
        </v-row>
    </div>
</template>