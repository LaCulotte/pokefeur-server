import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
import type { SupportedLanguages } from "../../../resources/interfaces";
import { LANGS } from "../../common/constants";
import { staticDataStore, loadDataStore } from "../data/static/vueStaticData";
import type { StaticLangData } from '../../api/staticData/interfaces';
import { useRouter } from "vue-router";

let currLang = localStorage.getItem("lang") as SupportedLanguages;
if (currLang == null || !(LANGS.includes(currLang))) {
    currLang = "fr";
    localStorage.setItem("lang", "fr");
}

export const lang: Ref<SupportedLanguages> = ref(currLang);
if (staticDataStore[lang.value] === undefined) {
    loadDataStore(lang.value);
}

export const currLangData: ComputedRef<StaticLangData | undefined> = computed(() => {
    return staticDataStore[lang.value];
});

watch(lang, () => {
    localStorage.setItem("lang", lang.value);

    if (staticDataStore[lang.value] === undefined) {
        loadDataStore(lang.value);
    }
});

declare global {
  interface Window {
    setLang: (newLang: string) => void;
  }
}

window.setLang = (newLang: string) => { if (LANGS.includes(newLang as SupportedLanguages)) lang.value = newLang as SupportedLanguages; };
