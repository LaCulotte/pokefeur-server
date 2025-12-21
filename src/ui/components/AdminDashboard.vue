<script setup lang="ts">
import { computed, ref, type Ref, watch } from 'vue';
import { user } from '../data/user/vueUserData';
import type { ItemType } from '@/api/data/interfaces';

import { staticDataStore } from '../data/static/vueStaticData';
import { lang } from '../controller/lang';
import type { SerieStaticLangData, SetStaticLangData, CardStaticLangData } from '@/api/staticData/interfaces';
import { useDisplay } from 'vuetify';

const type: Ref<ItemType> = ref("card")

const serie: Ref<SerieStaticLangData | null> = ref(null);
const set: Ref<SetStaticLangData | null> = ref(null);
const card: Ref<CardStaticLangData | null> = ref(null);

watch(serie, (serieNew, serieOld) => {
    if (serieOld !== serieNew || serieNew === null) {
        set.value = null;
        card.value = null;
    }
});

watch(set, (setNew, setOld) => {
    if (setOld !== setNew || setNew === null) {
        card.value = null;
    }
});

const seriesAutocomplete = computed(() => {
    // return Object.keys(staticDataStore[lang.value]?.sets ?? {});
    let langData = staticDataStore[lang.value];
    if (langData === undefined)
        return [];

    return Object.values(langData.series).map((serie) => {
        return {
            title: `${serie.name} (${serie.id})`,
            value: serie
        };
    });
});


const setsAutocomplete = computed(() => {
    if (serie.value === null) {
        return [];
    }

    return Object.values(serie.value.sets).map((set) => {
        return {
            title: `${set.name} (${set.id})`,
            value: set
        }
    })
});

const cardsAutocomplete = computed(() => {
    if (set.value === null) {
        return [];
    }

    return Object.values(set.value.cards).map((card) => {
        return {
            title: `${card.name} (${card.localId})`,
            value: card
        }
    })
});

const id = computed(() => {
    if (type.value == 'booster' && set.value !== null) {
        return set.value.id;
    } else if (type.value == 'card' && card.value !== null) {
        return card.value.id;
    }

    return '';
});

const { xlAndUp, lgAndUp, smAndDown } = useDisplay()
const cols = computed(() => {
    return xlAndUp.value ? 6
        : 12;
});

</script>

<template>
    <v-form @submit.prevent="user.addItem(type, id ?? '')">
        <v-row>
            <v-col :cols="cols">
                <v-select hide-details="auto" density="compact" v-model="type" :items="['card', 'booster']"></v-select>
            </v-col>
            <v-col :cols="cols">
                <v-autocomplete hide-details="auto" density="compact" type="text" v-model="serie" :items="seriesAutocomplete"></v-autocomplete>
            </v-col>
            <v-col :cols="cols" v-if="serie">
                <v-autocomplete hide-details="auto" density="compact" type="text" v-model="set" :items="setsAutocomplete"></v-autocomplete>
            </v-col>
            <v-col :cols="cols" v-if="set && type == 'card'">
                <v-autocomplete hide-details="auto" density="compact" type="text" v-model="card" :items="cardsAutocomplete"></v-autocomplete>
            </v-col>
        </v-row>
        <v-row>
            <v-btn type="submit" :disabled="id == ''">Add</v-btn>
        </v-row>
    </v-form>
</template>