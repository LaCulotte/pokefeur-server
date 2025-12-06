<script setup lang="ts">
import { ref } from 'vue';
import type { User } from '../../api/data/interfaces';

const username = ref("");
const errorMessage = ref("");


fetch("/api/getUser", { method: "GET" })
    .then((res) => res.json())
    .then((data: {user: User}) => {
        if (data.user) {
            console.log("Logged in as:", data.user.username);
            username.value = data.user.username;
        } else {
            console.log("Not logged")
        }
    })
    .catch((err) => {
        console.error("Error fetching user data:", err);
    });


function login() {
    console.log({ username: username.value })
    fetch(`/api/login`, {
                method: "POST",
                body: JSON.stringify({ username: username.value }),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        )
        .then((res) => {
            if (res.status == 200) {
                window.location.href = "/src/ui/";
            } else if (res.status == 400) {
                return res.json().then((data) => {
                    errorMessage.value = data.errors;
                });
            } else {
                return res.json().then((data) => {
                    errorMessage.value = data.message;
                });
            }
        })
        .then(a => console.log(`a: ${a}`))
        .catch((err) => {
            errorMessage.value = `Error when fetching data : ${err}`
        });
};

</script>

<template>
    <form @submit.prevent="login"> 
        <input v-model="username" type="text" placeholder="Username" />
        <input type="submit" value="Login"></input>
    </form>

    <div v-if="errorMessage !== ''">Login failed : {{ errorMessage }}</div>
</template>