<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { staticDataStore, loadDataStore } from './data/static/vueStaticData';
import type { User } from '../api/data/interfaces';
import { lang } from './controller/lang';

import Inventory from './components/Inventory.vue';
import type { SupportedLanguages } from '../../resources/interfaces';

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
            window.location.href = "/login/";
        }
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
            window.location.href = "/login/";
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
    <div>
        <select v-model="lang">
            <option value="fr">fr</option>
            <option value="en">en</option>
        </select>
    </div>
    <h1>Hello {{ username }} !</h1>
    <div>
        <button @click="logout">Logout</button>
    </div>

    <br></br>

    <div v-if="staticDataStore[lang] !== undefined">
        <div>{{ Object.keys(staticDataStore[lang]?.series ?? {}).length }} series loaded !</div>
        <div>{{ Object.keys(staticDataStore[lang]?.sets ?? {}).length }} sets loaded !</div>
        <div>{{ Object.keys(staticDataStore[lang]?.cards ?? {}).length }} cards loaded !</div>

        <div v-if="staticDataStore['fr'] && staticDataStore['en']">
            {{ Object.keys(staticDataStore["en"]?.series ?? {}).filter((k) => !(k in (staticDataStore["fr"]?.series ?? {}))) }}
        </div>

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
