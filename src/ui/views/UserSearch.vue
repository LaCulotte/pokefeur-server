<script setup lang="ts">
import { useRouter } from 'vue-router'

import { user } from '../data/user/vueUserData';
import UserAvatar from '../components/users/UserAvatar.vue';
import { ref, type Ref } from 'vue';
import type { UserSearchResult } from '@/api/model/interfaces';
import { expected, unexpected, type Expected } from '../../common/utils';
import UserShortDisplay from '../components/users/UserShortDisplay.vue';

document.title = "Search Users";
const router = useRouter();

const searchResult: Ref<Expected<UserSearchResult[]> | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(false);

const search: Ref<string> = ref("");

function searchUsers() {
    loading.value = true;
    const url = "/api/searchUsers?" + new window.URLSearchParams({ usernameQuery : search.value }).toString();

    fetch(url)
    .then(response => response.json())
    .then(data => {
        searchResult.value = expected(data);
        loading.value = false;
    })
    .catch(error => {
        searchResult.value = unexpected(error);
        loading.value = false;
    });
}
</script>

<template>
    <div class="h-screen d-flex flex-column">
        <div class="sticky-header">
            <v-sheet
                :elevation="3"
                color="transparent"
            >
                <v-container fluid>
                    <v-form
                        @submit.prevent="searchUsers"
                    >
                        <v-row class="d-flex justify-center mt-0">
                            <user-avatar
                                class="elevation-3"
                                :username="user.data.username"
                                :size="64"
                                @click="router.push('/profile-edit')"
                            />
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    v-model="search"
                                    label="Search users"
                                    variant="outlined"
                                    hide-details
                                />
                            </v-col>
                            <v-col
                                cols="auto"
                                class="d-flex align-center"
                            >
                                <v-btn
                                    icon="mdi-magnify"
                                    rounded="xl"
                                    color="cadetblue"
                                    type="submit"
                                />
                            </v-col>
                        </v-row>
                    </v-form>
                </v-container>
            </v-sheet>
        </div>
        <v-card
            :loading="loading"
            style="overflow: auto;"
            :disabled="loading"
            class="h-100 w-100"
        >
            <v-container
                v-if="searchResult === undefined" 
                class="h-100 w-100 d-flex flex-row align-center justify-center"
            >
                Please search a user
            </v-container>
            <v-container
                v-else-if="!searchResult.has_value()" 
                class="h-100 w-100 d-flex flex-row align-center justify-center"
            >
                Error while searching users : {{ searchResult.error() }}
            </v-container>
            <v-container
                v-else-if="searchResult.value().length == 0" 
                class="h-100 w-100 d-flex flex-row align-center justify-center"
            >
                No user found !
            </v-container>
            <div
                v-else
            >
                <user-short-display
                    v-for="res of searchResult.value()"
                    :key="res.uid"
                    :res="res"
                />
            </div>
        </v-card>
        <v-btn
            class="position-absolute d-flex" 
            style="bottom: 5%; left: 5%; z-index: 20;"
            rounded="xl"
            icon="mdi-home"
            to="/"
        />
    </div>
</template>

<style scoped>
.sticky-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: none;
}
</style>