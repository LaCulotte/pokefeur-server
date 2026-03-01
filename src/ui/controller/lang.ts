import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
import type { SupportedLanguages } from "../../../resources/interfaces";
import { LANGS } from "../../common/constants";
import { staticDataStore, loadDataStore } from "../data/static/vueStaticData";
import type { StaticLangData } from '../../api/staticData/interfaces';

let currLang = localStorage.getItem("lang");
if (currLang == null || !(currLang in LANGS)) {
    currLang = "fr";
    localStorage.setItem("lang", "fr");
}

export const lang: Ref<SupportedLanguages> = ref(currLang as SupportedLanguages);
if (staticDataStore[lang.value] === undefined) {
    loadDataStore(lang.value);
}

export const currLangData: ComputedRef<StaticLangData | undefined> = computed(() => {
    return staticDataStore[lang.value];
})

watch(lang, () => {
    localStorage.setItem("lang", lang.value);

    if (staticDataStore[lang.value] === undefined) {
        loadDataStore(lang.value);
    }
});
