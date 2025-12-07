import type { StaticLangData } from "@/api/staticData/interfaces";
import { reactive, type Reactive } from "vue";
import { UiStaticDataSingleton } from "./uiStaticData";
import type { SupportedLanguages } from "../../../../resources/interfaces";

export const staticDataStore: Reactive<StaticLangData> = reactive({});

export async function loadDataStore(lang: SupportedLanguages) {
    await UiStaticDataSingleton.load(lang);

    staticDataStore[lang] = UiStaticDataSingleton.getInstance().staticLangData[lang];
}