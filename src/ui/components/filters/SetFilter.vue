<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch, type Ref } from 'vue';
import { removeAccents } from '../../../common/utils';
// import { searchPokemonItems } from '../../controller/staticDataHelper';
import { lang } from '../../controller/lang';
import { staticDataStore } from '../../data/static/vueStaticData';
// import PokemonIcon from '../PokemonIcon.vue';

const props = defineProps<{
    selected?: Set<string>,
}>();

const emits = defineEmits<{
    select: [string]
}>();

const input = ref("");
const sanatizedInput = computed(() => {
    return removeAccents(input.value);
});

const sets = computed(() => {
    const data = staticDataStore[lang.value]?.sets ?? {};

    return Object.values(data).map((data) => {
        return {
            title: "",
            value: data.id,
            name: data.name,
            symbol: data.symbol,
            searchName: removeAccents(data.name)
        };
    });
});

const trueItems = computed(() => {
    if (input.value.length < 2) {
        return [];
    }

    return sets.value.filter((set) => {
        return set.searchName.includes(sanatizedInput.value) && !props.selected?.has(set.value);
    });
});

function temp_replace(url: string): string {
    return url.replace("https://assets.tcgdex.net", `http://${window.location.hostname}:8000`);
}
</script>

<template>
    <v-autocomplete
        :items="trueItems"
        v-model:search="input"
        hide-details
        autofocus
        :menu-props="{ contentProps: { style: 'max-height: 25vh' } }"
        :custom-filter="() => true"
        @update:focused="() => {}"
    >
        <template v-slot:item="{ item, props: itemProps }">
            <v-list-item
                @click="emits('select', item.value)"
                v-bind="itemProps"
            >
                <template v-slot:title>
                    <v-row
                        class="h-100"
                        gap="0"
                    >
                        <v-col
                            cols="10"
                            class="text-truncate"
                        >
                            {{ item.name }}
                        </v-col>
                        <v-divider vertical />
                        <v-col
                            class="pa-0 d-flex align-center justify-center"
                            cols="2"
                        >
                            <img
                                v-if="item.symbol"
                                style="max-width: 20px; max-height: 20px;"
                                :src="temp_replace(`${item.symbol}.webp`)"
                            >
                        </v-col>
                    </v-row>
                </template>
            </v-list-item>
        </template>
    </v-autocomplete>
    <!-- <v-text-field
        v-model="input"
        hide-details
        autofocus
    />
    <div
        v-for="item in trueItems"
        :key="item.value"
        @click="emits('select', item.value)"
    >
        <v-row
            class="h-100"
            style="height: 40px;"
        >
            <v-col
                style="max-width: 40px;"
                class="pa-0"
            >
                <pokemon-icon
                    :id="item.value"
                />
            </v-col>
            <v-col>
                {{ item.title }}(#{{ item.value }})
            </v-col>
        </v-row>
    </div> -->
</template>
