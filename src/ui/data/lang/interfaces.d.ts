import type { SupportedLanguages } from "../../../../resources/interfaces";
import type { Type, Rarity, Category, TrainerType } from "@/common/constants";

export interface LangDictionnary {
    typeNames: Partial<Record<Type, string>>
    rarityNames: Partial<Record<Rarity, string>>
    categoryNames: Partial<Record<Category, string>>
    trainerTypeNames: Partial<Record<TrainerType, string>>
}

export type Dictionnary = Partial<Record<SupportedLanguages, LangDictionnary>>;