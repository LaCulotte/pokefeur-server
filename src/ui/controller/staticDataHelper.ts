import { staticDataStore, pokemonData } from '../data/static/vueStaticData';
import { lang } from '../controller/lang';

import { Category, Rarity, Type } from '../../common/constants';
import type { CardStaticLangData, SetStaticLangData } from '../../api/staticData/interfaces';
import type { LangDictionnary } from "../data/lang/interfaces";
import { langDict } from "../data/lang/langDict";

import { computed, watch, type ComputedRef } from 'vue';
import type { ItemType } from '@/api/model/interfaces';
import type { PokemonData } from '@/compiler/interfaces';
import type { SupportedLanguages } from '../../../resources/interfaces';

export const unknownCard: CardStaticLangData = {
    types: [ Type.UNDEFINED ],
    dexId: [0],
    lang: "en",
    id: "0",
    name: "Weird Card",
    setId: "0",
    localId: "0",
    image: "/static/images/placeholders/invalid/card",
    category: Category.UNDEFINED,
    rarity: Rarity.UNDEFINED
};

export const unknownSet: SetStaticLangData = {
    lang: "en",
    id: "0",
    serieId: "0",
    name: `Weird Set`,
    releaseDate: "1970-01-01",
    releaseDateTs: 0,
    cardCount: {
        official: 0,
        total: 0
    },
    cards: {},
    logo: "/static/images/placeholders/invalid/logo",
    symbol: ""
};

export function getCardLangData(cardId: string): ComputedRef<CardStaticLangData> {
    return computed(() => {
        return staticDataStore[lang.value]?.cards[cardId] ?? unknownCard;
    });
}

export function getSetLangData(boosterId: string): ComputedRef<SetStaticLangData> {
    return computed(() => {
        return staticDataStore[lang.value]?.sets[boosterId] ?? unknownSet;
    });
}

export function getItemLangData(itemType: ItemType, id: string): ComputedRef<SetStaticLangData | CardStaticLangData> {
    if (itemType == "booster") {
        return getSetLangData(id);
    } else {
        return getCardLangData(id);
    }
}

export function getPokemonData(): ComputedRef<PokemonData[SupportedLanguages] | undefined> {
    return computed(() => {
        return pokemonData[lang.value];
    });
}

export function getPokemonName(pokemonId: number): ComputedRef<string> {
    return computed(() => {
        return pokemonData[lang.value]?.id_to_name[pokemonId] ?? "MissingNo.";
    });
}

export function getPokemonId(pokemonName: string): ComputedRef<number> {
    return computed(() => {
        return pokemonData[lang.value]?.name_to_id[pokemonName] ?? 0;
    });
}

export function getLangString<T extends keyof LangDictionnary>(key: T, subKey: keyof LangDictionnary[T]): ComputedRef<string> {
    return computed(() => {
        let ret = langDict[lang.value]?.[key]?.[subKey] as string | undefined;
        if (ret === undefined) {
            ret = langDict.en?.[key]?.[subKey] as string | undefined ?? `missing_${key}_${String(subKey)}`;
        }
        return ret;
    });
}

export let searchPokemonItems: {title: string, value: number, searchName: string}[] = [];

watch([pokemonData, lang], () => {
    const data = pokemonData[lang.value];
    searchPokemonItems = Object.entries(data?.name_to_id ?? {}).map(([name, id]) => { 
        return {
            title: data?.id_to_name[id] ?? '',
            value: id,
            searchName: name
        }; 
    });
});