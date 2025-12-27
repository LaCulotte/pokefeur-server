<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToCollection() {
    router.push("/collection")
}

</script>

<template>
    <div class="background h-screen">
        <v-img ref="img" class="main-img" style="" src="/static/images/Room-v0.png"></v-img>

        <div class="position-absolute w-100 pa-6" style="top: 3%;">
            <v-progress-linear
            color="light-green-darken-4"
            height="30"
            model-value="50"
            striped
            rounded="xl"
            style="box-shadow: 0 0 10px;"
            >
                <strong style="color: white">Booster en cours; 69 mins restantes ...</strong>
            </v-progress-linear>
        </div>

        <div class="position-absolute d-flex" style="bottom: 5%; left: 5%;">
            <v-btn class="collection-btn" rounded="xl" icon="$vuetify" @click="goToCollection"></v-btn>
            <div class="flex-shrink-0" style="flex: 2 2;"></div>
        </div>
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

.filler {
    flex: 1 1;
}

</style>