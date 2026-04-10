<script setup lang="ts">
import { useRouter } from 'vue-router';

document.title = "Room";

const router = useRouter();
</script>

<template>
    <div class="background h-screen">
        <div class="h-100 d-flex flex-column justify-center">
            <div
                style="flex: 1 1"
                class="d-flex flex-column justify-center"
            >
                <div class="pa-6">
                    <!-- <v-progress-linear
                        color="light-green-darken-4"
                        height="30"
                        model-value="50"
                        striped
                        rounded="xl"
                        style="box-shadow: 0 0 10px;"
                        <strong style="color: white">Booster en cours; 69 mins restantes ...</strong>
                    </v-progress-linear> -->
                </div>
            </div>

            <div style="flex: 3 3; max-height: 90%">
                <v-img
                    class="main-img h-100"
                    ref="img"
                    src="/static/images/Room-v0.png"
                />
            </div>

            <div style="flex: 1 1" />
        </div>


        <v-btn
            class="position-absolute"
            style="top: 5%; right: 5%;"
            rounded="xl"
            icon="mdi-account"
            to="/user-search"
        />
        <v-btn
            class="position-absolute"
            style="bottom: 5%; left: 5%;"
            rounded="xl"
            icon="mdi-view-grid-outline"
            to="/collection"
        />
        <v-btn
            class="position-absolute"
            style="bottom: 5%; right: 5%;"
            rounded="xl"
            icon="mdi-currency-usd"
            to="/dealership"
        />
    </div>
</template>

<style>
.background {
    background-color:cadetblue;
}

.main-img {
    image-rendering: pixelated;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>