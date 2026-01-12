import type { SupportedLanguages, Card, Types } from "../../resources/interfaces"

export const DEFAULT_LANG: SupportedLanguages = "en";
export const LANGS: Array<SupportedLanguages> = ["en", "fr"];
export const ALL_LANGS: Array<SupportedLanguages> = [
    'en', 'fr', 'es', 'es-mx', 'it', 'pt', 'pt-br', 'pt-pt', 'de', 'nl', 'pl', 'ru',
    'ja', 'ko', 'zh-tw', 'id', 'th', 'zh-cn'
]

export const DATABASE: string = "resources/data";
export const GENERATED_DIR: string = "resources/generated"

export enum Category {
    UNDEFINED = -1,
    POKEMON = 0,
    TRAINER,
    ENERGY,
}

export const CategoryMap: Record<Card["category"], Category> = {
    "Pokemon": Category.POKEMON,
    "Trainer": Category.TRAINER,
    "Energy": Category.ENERGY,
}

export enum Type {
    UNDEFINED = -1,
    COLORLESS = 0,
    DARKNESS,
    DRAGON,
    FAIRY,
    FIGHTING,
    FIRE,
    GRASS,
    LIGHTNING,
    METAL,
    PSYCHIC,
    WATER,
}

export const TypeMap: Record<Types, Type> = {
    "Colorless": Type.COLORLESS,
    "Darkness": Type.DARKNESS,
    "Dragon": Type.DRAGON,
    "Fairy": Type.FAIRY,
    "Fighting": Type.FIGHTING,
    "Fire": Type.FIRE,
    "Grass": Type.GRASS,
    "Lightning": Type.LIGHTNING,
    "Metal": Type.METAL,
    "Psychic": Type.PSYCHIC,
    "Water": Type.WATER,
}

export enum Stage {
    UNDEFINED = -1,
    BABY = 0,
    BASIC,
    BREAK,
    LEVEL_UP,
    MEGA,
    RESTORED,
    STAGE_1,
    STAGE_2,
    V_UNION,
    VMAX,
    VSTAR,
}

export const StageMap: Record<NonNullable<Card["stage"]>, Stage> = {
    "Baby": Stage.BABY,
    "Basic": Stage.BASIC,
    "BREAK": Stage.BREAK,
    "LEVEL-UP": Stage.LEVEL_UP,
    "MEGA": Stage.MEGA,
    "RESTORED": Stage.RESTORED,
    "Stage1": Stage.STAGE_1,
    "Stage2": Stage.STAGE_2,
    "V-UNION": Stage.V_UNION,
    "VMAX": Stage.VMAX,
    "VSTAR": Stage.VSTAR,
}

export enum Suffix {
    UNDEFINED = -1,
    EX = 0,
    GX,
    LEGEND,
    PRIME,
    SP,
    TAG_TEAM_GX,
    V,
}

export const SuffixMap: Record<NonNullable<Card["suffix"]>, Suffix> = {
    "EX": Suffix.EX,
    "GX": Suffix.GX,
    "Legend": Suffix.LEGEND,
    "Prime": Suffix.PRIME,
    "SP": Suffix.SP,
    "TAG TEAM-GX": Suffix.TAG_TEAM_GX,
    "V": Suffix.V,
}

export enum Rarity {
    UNDEFINED = -1,
    ACE_SPEC_RARE = 0,
    AMAZING_RARE,
    CLASSIC_COLLECTION,
    COMMON,
    DOUBLE_RARE,
    FULL_ART_TRAINER,
    HOLO_RARE,
    HOLO_RARE_V,
    HOLO_RARE_VMAX,
    HOLO_RARE_VSTAR,
    HYPER_RARE,
    ILLUSTRATION_RARE,
    LEGEND,
    NONE,
    RADIANT_RARE,
    RARE,
    RARE_HOLO,
    RARE_HOLO_LV_X,
    RARE_PRIME,
    SECRET_RARE,
    SHINY_RARE,
    SHINY_RARE_V,
    SHINY_RARE_VMAX,
    SHINY_ULTRA_RARE,
    SPECIAL_ILLUSTRATION_RARE,
    ULTRA_RARE,
    UNCOMMON,
    ONE_STAR,
    TWO_STAR,
    THREE_STAR,
    CROWN,
    ONE_DIAMOND,
    TWO_DIAMOND,
    THREE_DIAMOND,
    FOUR_DIAMOND,
    ONE_SHINY,
    TWO_SHINY,
    THREE_SHINY,
    BLACK_WHITE_RARE,
    MEGA_HYPER_RARE,
}

export const RarityMap: Record<Card["rarity"], Rarity> = {
    "ACE SPEC Rare": Rarity.ACE_SPEC_RARE,
    "Amazing Rare": Rarity.AMAZING_RARE,
    "Classic Collection": Rarity.CLASSIC_COLLECTION,
    "Common": Rarity.COMMON,
    "Double rare": Rarity.DOUBLE_RARE,
    "Full Art Trainer": Rarity.FULL_ART_TRAINER,
    "Holo Rare": Rarity.HOLO_RARE,
    "Holo Rare V": Rarity.HOLO_RARE_V,
    "Holo Rare VMAX": Rarity.HOLO_RARE_VMAX,
    "Holo Rare VSTAR": Rarity.HOLO_RARE_VSTAR,
    "Hyper rare": Rarity.HYPER_RARE,
    "Illustration rare": Rarity.ILLUSTRATION_RARE,
    "LEGEND": Rarity.LEGEND,
    "None": Rarity.NONE,
    "Radiant Rare": Rarity.RADIANT_RARE,
    "Rare": Rarity.RARE,
    "Rare Holo": Rarity.RARE_HOLO,
    "Rare Holo LV.X": Rarity.RARE_HOLO_LV_X,
    "Rare PRIME": Rarity.RARE_PRIME,
    "Secret Rare": Rarity.SECRET_RARE,
    "Shiny rare": Rarity.SHINY_RARE,
    "Shiny rare V": Rarity.SHINY_RARE_V,
    "Shiny rare VMAX": Rarity.SHINY_RARE_VMAX,
    "Shiny Ultra Rare": Rarity.SHINY_ULTRA_RARE,
    "Special illustration rare": Rarity.SPECIAL_ILLUSTRATION_RARE,
    "Ultra Rare": Rarity.ULTRA_RARE,
    "Uncommon": Rarity.UNCOMMON,
    "One Star": Rarity.ONE_STAR,
    "Two Star": Rarity.TWO_STAR,
    "Three Star": Rarity.THREE_STAR,
    "Crown": Rarity.CROWN,
    "One Diamond": Rarity.ONE_DIAMOND,
    "Two Diamond": Rarity.TWO_DIAMOND,
    "Three Diamond": Rarity.THREE_DIAMOND,
    "Four Diamond": Rarity.FOUR_DIAMOND,
    "One Shiny": Rarity.ONE_SHINY,
    "Two Shiny": Rarity.TWO_SHINY,
    // "Three Shiny": Rarity.THREE_SHINY,
    "Black White Rare": Rarity.BLACK_WHITE_RARE,
    "Mega Hyper Rare": Rarity.MEGA_HYPER_RARE,
}

export enum TrainerType {
    UNDEFINED = -1,
    ACE_SPEC,
    GOLDENROD_GAME_CORNER,
    ITEM,
    ROCKETS_SECRET_MACHINE,
    STADIUM,
    SUPPORTER,
    TECHNICAL_MACHINE,
    TOOL,
}

export const TrainerTypeMap: Record<NonNullable<Card["trainerType"]>, TrainerType> = {
    "Ace Spec": TrainerType.ACE_SPEC,
    "Goldenrod Game Corner": TrainerType.GOLDENROD_GAME_CORNER, // Useless ?
    "Item": TrainerType.ITEM,
    "Rocket's Secret Machine": TrainerType.ROCKETS_SECRET_MACHINE,
    "Stadium": TrainerType.STADIUM,
    "Supporter": TrainerType.SUPPORTER,
    "Technical Machine": TrainerType.TECHNICAL_MACHINE,
    "Tool": TrainerType.TOOL,
}

export const SUPPORTED_ENERGY_TYPES: Array<Type> = [
    Type.COLORLESS,
    Type.FIGHTING,
    Type.FIRE,
    Type.GRASS,
    Type.LIGHTNING,
    Type.PSYCHIC,
    Type.WATER,
]
