<script setup lang="ts">
import type { InternalItem } from 'vuetify';
import { getPokemonData, getPokemonName } from '../../controller/staticDataHelper';
import { computed, nextTick, onMounted, ref, useTemplateRef, watch, type Ref } from 'vue';
import { removeAccents } from '../../../common/utils';
import { searchPokemonItems } from '../../controller/staticDataHelper';
import PokemonIcon from '../PokemonIcon.vue';

const props = defineProps<{
    selected?: Set<number>,
}>();

const emits = defineEmits<{
    select: [number]
}>();

const input = ref("");
const sanatizedInput = computed(() => {
    return removeAccents(input.value);
});

const trueItems = computed(() => {
    if (input.value.length < 3) {
        return [];
    }

    return searchPokemonItems.filter((item) => {
        return item.searchName.includes(sanatizedInput.value) && !props.selected?.has(item.value);
    });
});
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
                    >
                        <v-col cols="2">
                            #{{ item.value }}
                        </v-col>
                        <v-divider vertical />

                        <v-col>
                            {{ item.title }}
                        </v-col>
                        <v-divider vertical />
                        <v-col
                            style="max-width: 40px;"
                            class="pa-0"
                        >
                            <pokemon-icon
                                :id="item.value"
                            />
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
