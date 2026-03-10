import type { StaticLangDataStore, StaticLangData } from "@/api/staticData/interfaces";
import { reactive, type Reactive } from "vue";
import { UiStaticDataSingleton } from "./uiStaticData";
import type { SupportedLanguages } from "../../../../resources/interfaces";
import type { PokemonData } from "@/compiler/interfaces";

export const staticDataStore: Reactive<StaticLangDataStore> = reactive({});
export const pokemonData: Reactive<PokemonData> = reactive({});

export async function loadDataStore(lang: SupportedLanguages): Promise<StaticLangData> {
    await UiStaticDataSingleton.load(lang);

    staticDataStore[lang] = UiStaticDataSingleton.getInstance().staticLangDataStore[lang];
    pokemonData[lang] = UiStaticDataSingleton.getInstance().pokemonData[lang];

    return staticDataStore[lang]!;
}