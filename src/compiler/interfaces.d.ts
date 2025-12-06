import type { SupportedLanguages, ISODate } from "../../resources/interfaces"
import { Category, Type, Stage, Suffix, Rarity, TrainerType } from "../common/constants";

export interface CardData {
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

export interface SetData {
    id: string
    serieId: string
    releaseDate: ISODate    // TODO : To timestamp ?
    releaseDateTs: number
    cardCount: {
        official: number
        total: number
    }
    cards: Array<string>
}

export interface SerieData {
    id: string
    sets: Array<string>
}

export interface BackendData {
    series: Record<string, SerieData>
    sets: Record<string, SetData>
    cards: Record<string, CardData>
}


export interface CardLangData {
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

export interface SetLangData {
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
    cards: Record<string, SupportedLanguages>,
    logo: string,
    symbol: string,
}

export interface SerieLangData {
    lang: SupportedLanguages
    id: string
    name: string
    sets: Record<string, SupportedLanguages>
}

export interface LangData {
    series: Partial<Record<SupportedLanguages, Record<string, SerieLangData>>>
    sets: Partial<Record<SupportedLanguages, Record<string, SetLangData>>>
    cards: Partial<Record<SupportedLanguages, Record<string, CardLangData>>>
}
