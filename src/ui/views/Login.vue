<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { user } from '../data/user/vueUserData';

const username = ref("");
const errorMessage = ref("");
const router = useRouter()

async function action() {
    if (await user.isAuthenticated()) {
        user.logout();
    } else {
        await user.login(username.value);
        let dest = localStorage.getItem("login-dest");
        if (dest !== null) {
            router.push(dest);
        } else {
            router.push("/");
        }
    }
}

</script>

<template>
    <div v-if="user.isAuthenticatedFlag">Logged as {{ user.data.username }}</div>
    <div v-else>Not Logged</div>

    <v-form @submit.prevent="action"> 
        <v-text-field v-model="username" type="text" placeholder="Username" />
        <v-btn type="submit" value="Login">{{ user.isAuthenticatedFlag ? 'Logout' : 'Login'}}</v-btn>
    </v-form>

    <v-sheet v-if="errorMessage !== ''">Login failed : {{ errorMessage }}</v-sheet>
</template>