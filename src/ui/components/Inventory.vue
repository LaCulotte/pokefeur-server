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

    <h1>salut {{ user.data.username }} !</h1>
    <div>
        <div>
            <form @submit.prevent="user.addItem(type as ItemType, id)">
                <label for="type">type</label>
                <select name="type" v-model="type">
                    <option value="card">card</option>
                    <option value="booster">booster</option>
                </select>

                <label for="id">id</label>
                <input name="id" v-model="id"></input>
                <input type="submit" :value="`add`"></input>
            </form>
        </div>

        Inventaire :
        <div>
            Cartes : {{ counts.cards }}; Boosters : {{ counts.boosters }}
        </div>
        <div v-for="obj of Object.values(user.data.inventory)">
            <item :item="obj" :key="obj.uid"></item>
             <!-- <card v-if="obj.type == 'card'" :item="obj" :key="`c-${obj.uid}`"></card>
             <booster v-else :item="obj" :key="`b-${obj.uid}`"></booster> -->
        </div>
    </div>
</template>