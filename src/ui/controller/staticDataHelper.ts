import { staticDataStore } from '../data/static/vueStaticData';
import { lang } from '../controller/lang';

import { Category, Rarity } from '../../common/constants';
import type { CardStaticLangData, SetStaticLangData } from '../../api/staticData/interfaces';

import { computed, type ComputedRef } from 'vue';
import type { ItemType } from '@/api/model/interfaces';

export const unknownCard: CardStaticLangData = {
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
        return staticDataStore[lang.value]?.cards[cardId] ?? unknownCard
    });
}

export function getSetLangData(boosterId: string): ComputedRef<SetStaticLangData> {
    return computed(() => {
        return staticDataStore[lang.value]?.sets[boosterId] ?? unknownSet
    });
}

export function getItemLangData(itemType: ItemType, id: string): ComputedRef<SetStaticLangData | CardStaticLangData> {
    if (itemType == "booster") {
        return getSetLangData(id);
    } else {
        return getCardLangData(id);
    }
}