<script setup lang="ts">
import { computed, ref } from 'vue';
import { user } from '../data/user/vueUserData';
import type { ItemType } from '@/api/data/interfaces';
import Card from './Card.vue';
import Booster from './Booster.vue';
import Item from './Item.vue';

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

</script>

<template>
    <!-- <div v-for="obj of Object.values(user.data.inventory)">
        <item :item="obj" :key="obj.uid"></item>
    </div> -->

    <div>
        <v-row class="h-100 align-content-start">
            <v-col
            v-for="[i, obj] of Object.values(user.data.inventory).entries()"
            cols="4"
            class="h-25"
            :key="i"
            >
                <item :item="obj" :key="obj.uid" class=""></item>
            </v-col>
        </v-row>
    </div>
</template>