<script setup lang="ts">
import { expected, unexpected, type Expected } from '../../common/utils';
import type { InventoryItem, PublicUser } from '../../api/model/interfaces';
import { computed, onMounted, ref, useTemplateRef, type ComputedRef, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import Inventory from '../components/Inventory.vue';
import UserAvatar from '../components/users/UserAvatar.vue';

document.title = "Profile";

const router = useRouter();

const userUid = router.currentRoute.value.query.userUid;

const userData: Ref<Expected<PublicUser> | undefined> = ref(undefined);

const items = computed(() => {
    const test = userData.value;
    if (test === undefined) {
        return undefined;
    }


    if (test.has_value) {
        const val = test.value();
        return Object.values(test.value().inventory.items);
    } else {
        return undefined;
    }
});

async function init() {
    if (typeof(userUid) !== "string") {
        userData.value = unexpected("Invalid UserId URL");
        return;
    }

    const response = await fetch("/api/getPublicUser?" + new URLSearchParams({ userUid: userUid }).toString());

    if (!response.ok) {
        if (response.status == 404) {
            userData.value = unexpected("User not found");
        } else {
            userData.value = unexpected(`Error when querying user; Code '${response.status}'`);
        }

        console.error(response);
        return;
    }

    const jsonResponse = await response.json();
    userData.value = expected(jsonResponse.user);
    document.title = `Profile of ${userData.value.value().username}`;
}

onMounted(() => {
    try {
        init();
    } catch (err) {
        console.error("Error on init !", err);
        userData.value = unexpected("Error on init ?!");
    }
});

const scrollElem = useTemplateRef("scrollElem");

// const items: ComputedRef<Array<InventoryItem>> = computed(() => {
//     const ret: Array<InventoryItem> = [];

//     if (!userData.value?.has_value()) {
//         return ret;
//     }

//     for (const item of Object.values(userData.value.value().inventory.items)) {
//         ret.push({
//             ...item,
//         });
//     }

//     for (const item of Object.values(userData.value.value().inventory.inTradeItems)) {
//         ret.push({
//             ...item,
//         });
//     }

//     return ret;
// });
</script>

<template>
    <div class="h-screen w-screen">
        <v-btn
            class="position-absolute"
            style="top: var(--btn-offset); left: var(--btn-offset);"
            rounded="xl"
            icon="mdi-arrow-left"
            @click="router.back()"
        />

        <v-container v-if="!userData">
            Loading ...
        </v-container>
        <v-container
            v-else-if="userData.has_value"
            class="h-screen d-flex flex-column align-center justify-center"
        >
            <v-card elevation="2">
                <v-container class="d-flex flex-column justify-center align-center">
                    <user-avatar
                        :username="userData.value().username"
                        :size="128"
                    />
                    <div class="w-100 pa-3">
                        <v-divider />
                    </div>
                    <h2 class="text-headline-large">
                        {{ userData.value().username }}
                    </h2>
                    <div class="w-100 pa-3" />
                    <v-container
                        class="border rounded text-break text-center overflow-auto"
                        style="border-color: grey !important; max-width: 55vw; max-height: 40vw;"
                    >
                        {{ userData.value().description ?? '...' }}
                    </v-container>
                    <div class="w-100 pa-3" />
                    <v-dialog
                        content-class="profile-anchor"
                        class="on-top"
                    >
                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props">
                                VIEW INVENTORY
                            </v-btn>
                        </template>
                        <v-card>
                            <div
                                ref="scrollElem"
                                class="h-100 w-100 overflow-auto"
                            >
                                <inventory
                                    :items="Object.values(userData.value().inventory.items)"
                                    :scroll-elem="scrollElem"
                                    dialog-anchor="profile-dialog"
                                />
                            </div>
                        </v-card>
                    </v-dialog>
                    
                    <v-btn
                        class="mt-2"
                    >
                        PROPOSE TRADE
                    </v-btn>
                </v-container>
            </v-card>
        </v-container>
        <v-container v-else>
            Error on load : {{ userData.error() }}
        </v-container>
        <v-btn
            class="position-absolute" 
            style="bottom: var(--btn-offset); left: var(--btn-offset); z-index: 20;"
            rounded="xl"
            icon="mdi-home"
            to="/"
        />
    </div>
</template>

<style scoped>
:deep(.profile-anchor) {
    anchor-name: --profile-dialog;
}

.on-top > :deep(.v-overlay__content) {
    position: absolute;
    top: 0;
}
</style>