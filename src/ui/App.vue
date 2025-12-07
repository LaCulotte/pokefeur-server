<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { staticDataStore, loadDataStore } from './data/static/vueStaticData';
import type { User } from '../api/data/interfaces';

import Inventory from './components/Inventory.vue';

const username = ref("");

fetch("/api/getUser", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then((res) => res.json())
    .then((data: {user: User}) => {
        if (data.user) {
            username.value = data.user.username;
        } else {
            window.location.href = "/src/ui/login/";
        }
    })
    .then(() => {
        loadDataStore("fr");
    })
    .catch(err => {
        console.error("Error fetching user data:", err);
        username.value = "Error !!";
    });

function logout() {
    fetch("/api/logout", {
            method: "POST",
        })
        .then(() => {
            window.location.href = "/src/ui/login/";
        })
        .catch(err => {
            console.error("Error fetching user data:", err);
        });
}

const url = ref("/api/");
const method = ref("GET");
const body = ref("");
const res = ref("")

function easyFetch() {
    if (method.value == "GET" && !!body.value) {
        res.value = "Cannot have a body on GET request"
        return;
    }
    
    fetch(url.value, {
        method: method.value,
        body: body.value ? body.value : undefined,
        headers: body.value ? {
            "Content-Type": "application/json",
        } : {}
    })
    .then((res) => {
        return res.text()
    })
    .then((t) => {
        res.value = t.slice(0, 1000);
    });
}
</script>

<template>
    <h1>Hello {{ username }} !</h1>
    <div>
        <button @click="logout">Logout</button>
    </div>

    <div>{{ Object.keys(staticDataStore["fr"]?.sets ?? {}).length }} sets loaded !</div>
    <div>{{ Object.keys(staticDataStore["fr"]?.sets["base1"]?.cards ?? {}).length }} cards in base1 loaded !</div>

    <br></br>

    <div>
        <inventory/>
    </div>

    <br></br>

    <form @submit.prevent="easyFetch">
        <div>
            <input type="text" v-model="url"></input>
            <select v-model="method">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
            </select>
        </div>
        <div>
            <textarea type="text" v-model="body"></textarea>
        </div>
        <div>
            <input type="submit" value="send"></input>
        </div>
    </form>
    <div v-if="!!res">
        <div>Result :</div>
        <div v-html="res"></div>
    </div>
</template>

<style scoped></style>
