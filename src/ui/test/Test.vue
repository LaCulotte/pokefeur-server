<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { user } from '../data/user/vueUserData';

// const username = ref("");

// fetch("/api/getUser", {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//         }
//     })
//     .then((res) => res.json())
//     .then((data: {user: User}) => {
//         if (data.user) {
//             username.value = data.user.username;
//         } else {
//             window.location.href = "/login/";
//         }
//     })
//     .catch(err => {
//         console.error("Error fetching user data:", err);
//         username.value = "Error !!";
//     });

// function logout() {
//     fetch("/api/logout", {
//             method: "POST",
//         })
//         .then(() => {
//             window.location.href = "/login/";
//         })
//         .catch(err => {
//             console.error("Error fetching user data:", err);
//         });
// }

// const type = ref("card");
// const id = ref("")

// const counts = computed(() => {
//     let count = {
//         cards: 0,
//         boosters: 0
//     }

//     Object.values(user.data.inventory).forEach((item) => {
//         if (item.type == "booster")
//             count.boosters ++
//         else
//             count.cards ++
//     });

//     return count;
// });


const url = ref("/api/");
const method = ref("GET");
const body = ref("");
const res = ref("");

const isBodyValid = computed(() => {
    if (!body.value) {
        return true;
    }

    try {
        JSON.parse(body.value)
        return true;
    } catch(_) {
        return false;
    }
})

const fetchUrl = computed(() => {
    if (method.value != "GET") {
        return url.value;
    } else if (body.value && isBodyValid.value) {
        return url.value + "?" + new window.URLSearchParams(JSON.parse(body.value)).toString()
    }

    return url.value;
})

function easyFetch() {
    // if (method.value == "GET" && !!body.value) {
    //     res.value = "Cannot have a body on GET request"
    //     return;
    // }
    
    fetch(fetchUrl.value, {
        method: method.value,
        body: (method.value != "GET" && body.value) ? body.value : undefined,
        headers: body.value ? {
            "Content-Type": "application/json",
        } : {}
    })
    .then((res) => {
        return res.text()
    })
    .then((t) => {
        res.value = JSON.stringify(JSON.parse(t), null, 2).slice(0, 10000);
    });
}
</script>

<template>
    <div v-if="user.isAuthenticatedFlag">
        <v-form @submit.prevent="easyFetch">
            <v-row>
                <v-text-field type="text" v-model="url"></v-text-field>
                <v-select 
                    v-model="method"
                    :items="['GET', 'POST', 'PUT']"
                >
                </v-select>
            </v-row>
            <div>
                <v-textarea type="text" v-model="body"></v-textarea>
            </div>
            <div>
                <v-btn type="submit" :disabled="!isBodyValid">SEND</v-btn>
            </div>
        </v-form>
        <div v-if="!!res">
            <div>Result :</div>
            <!-- <div v-html="JSON.stringify(res, undefined, '\t')"></div>* -->
            <!-- <textarea v-model="jsonstr" rows="8" cols="40"></textarea> -->
            <pre>{{ res }}</pre>
        </div>
    </div>
    <div v-else>
        <a href="/login">Authenticate first !</a>
    </div>

</template>

<style scoped></style>
