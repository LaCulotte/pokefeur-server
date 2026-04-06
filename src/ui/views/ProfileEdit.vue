<script setup lang="ts">
import { watch, ref, onMounted, type Ref } from 'vue';

import { user } from '../data/user/vueUserData';
import UserAvatar from '../components/users/UserAvatar.vue';
import { useRouter } from 'vue-router';

const desc: Ref<string | undefined> = ref("Loading...");
const router = useRouter();

function logout() {
    user.logout().then(() => router.push('/login'));
}

onMounted(() => {
    desc.value = user.data.description;
});

watch(() => user.data.description, (newDesc, oldDesc) => {
    if (newDesc !== oldDesc) {
        desc.value = user.data.description;
    }
}, { immediate: true });
</script>

<template>
    <v-container
        class="h-screen d-flex flex-column justify-center align-center"
        fluid
    >
        <v-row class="w-100">
            <v-col class="d-flex flex-column justify-center align-center">
                <div class="text-h2 position-relative">
                    Profile
                    <div
                        class="position-absolute top-0 h-100 d-flex flex-column justify-center"
                        style="left: -58px;"
                    >
                        <v-btn
                            rounded="xl"
                            icon="mdi-arrow-left"
                            @click="router.back()"
                        />
                    </div>
                </div>
            </v-col>
            <!-- <v-col class="position-absolute d-flex flex-row justify-space-around align-center h-100"> -->
            <div />
            <!-- </v-col> -->
        </v-row>
        <v-spacer />
        <v-row>
            <v-col class="d-flex flex-column justify-center align-center">
                <v-card>
                    <v-container class="d-flex flex-column justify-center align-center">
                        <user-avatar
                            :username="user.data.username"
                            :size="128"
                        />
                        <div class="w-100 pa-3">
                            <v-divider />
                        </div>
                        <h2 class="text-h4">
                            {{ user.data.username }}
                        </h2>
                        <div class="w-100 pa-3" />
                        <v-textarea
                            placeholder="Describe yourself"
                            v-model="desc"
                        />
                        <v-btn
                            @click="user.changeDescription(desc)"
                            color="#5f9ea0"
                        >
                            Update description
                        </v-btn>
                        <v-btn
                            @click="logout"
                            color="error"
                            class="mt-2"
                        >
                            LOGOUT
                        </v-btn>
                    </v-container>
                </v-card>
            </v-col>
        </v-row>
        <v-spacer />
        <v-spacer />
    </v-container>
</template>
