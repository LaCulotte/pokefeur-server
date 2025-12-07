<script setup lang="ts">
import { computed, ref } from 'vue';
import { user } from '../data/user/vueUserData';
import type { ItemType } from '@/api/data/interfaces';

const type = ref("card");
const id = ref("")

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
        <div v-for="obj of Object.values(user.data.inventory)">
            {{ obj.type }} : {{ obj.id }}
        </div>
    </div>
</template>