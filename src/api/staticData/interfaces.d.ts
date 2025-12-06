import type { SupportedLanguages, ISODate } from "../../../resources/interfaces"
import { Category, Type, Stage, Suffix, Rarity, TrainerType } from "../../common/constants";

export interface CardStaticData {
    id: string
    setId: string
    localId: string
    name: string

    category: Category
    rarity: Rarity

    types?: Array<Type>
    stage?: Stage
    suffix?: Suffix
    dexId?: Array<number>
    trainerType?: TrainerType
}

export interface SetStaticData {
    id: string
    serieId: string
    releaseDate: ISODate    // TODO : To timestamp ?
    releaseDateTs: number
    cardCount: {
        official: number
        total: number
    }
    cards: Record<string, CardStaticData>
}

export interface SerieStaticData {
    id: string
    sets: Record<string, SetStaticData>
}

export interface StaticData {
    series: Record<string, SerieStaticData>
    sets: Record<string, SetStaticData>
    cards: Record<string, CardStaticData>
}


export interface CardStaticLangData {
    lang: SupportedLanguages
    id: string
    name: string
    setId: string
    localId: string
    image: string
    description?: string

    category: Category
    rarity: Rarity

    types?: Array<Type>
    stage?: Stage
    suffix?: Suffix
    dexId?: Array<number>
    trainerType?: TrainerType
}

export interface SetStaticLangData {
    lang: SupportedLanguages
    id: string
    serieId: string
    name: string
    releaseDate: ISODate    // TODO : To timestamp ?
    releaseDateTs: number
    cardCount: {
        official: number
        total: number
    }
    logo: string,
    symbol: string,
    cards: Record<string, CardStaticLangData>
}

export interface SerieStaticLangData {
    lang: SupportedLanguages
    id: string
    name: string
    sets: Record<string, SetStaticLangData>
}

export interface StaticLangData {
    series: Partial<Record<SupportedLanguages, Record<string, SerieStaticLangData>>>
    sets: Partial<Record<SupportedLanguages, Record<string, SetStaticLangData>>>
    cards: Partial<Record<SupportedLanguages, Record<string, CardStaticLangData>>>
}
