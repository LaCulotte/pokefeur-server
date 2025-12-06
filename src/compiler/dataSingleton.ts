import fs from "fs/promises"
import type { PathLike } from "fs"
import path from "path"

import type interfaces from "./interfaces"
import type { SupportedLanguages } from "../../resources/interfaces"

const backendData: interfaces.BackendData = {
    series: {},
    sets: {},
    cards: {},
}

const langData: interfaces.LangData = {
    series: {},
    sets: {},
    cards: {},
}

export function saveCard(card: interfaces.CardData) {
    backendData.cards[card.id] = card;
}

export function saveSet(set: interfaces.SetData) {
    backendData.sets[set.id] = set;
}

export function saveSerie(serie: interfaces.SerieData) {
    backendData.series[serie.id] = serie;
}


export function saveCardLang(card: interfaces.CardLangData) {
    let cards = langData.cards[card.lang];
    if (cards === undefined) {
        langData.cards[card.lang] = {
            [`${card.id}`]: card
        };
    } else {
        cards[card.id] = card;
    }
}

export function saveSetLang(set: interfaces.SetLangData) {
    let sets = langData.sets[set.lang];
    if (sets === undefined) {
        langData.sets[set.lang] = {
            [`${set.id}`]: set
        }
    } else {
        sets[set.id] = set;
    }
}

export function saveSerieLang(serie: interfaces.SerieLangData) {
    let series = langData.series[serie.lang];
    if (series === undefined) {
        langData.series[serie.lang] = {
            [`${serie.id}`]: serie
        }
    } else {
        series[serie.id] = serie;
    }
}

function doCardExistNoDefault(lang: SupportedLanguages, id: string) : boolean {
    let cards = langData.cards[lang];

    if (cards === undefined) {
        return false;
    }

    return cards[id] !== undefined;
}

export function doCardExist(lang: SupportedLanguages, id: string, defaultLang: SupportedLanguages | undefined) : SupportedLanguages | undefined {
    if (doCardExistNoDefault(lang, id)) {
        return lang;
    }

    if (defaultLang !== undefined && doCardExistNoDefault(defaultLang, id)) {
        return defaultLang;
    }

    for (let [lang, cards] of Object.entries(langData.cards)) {
        if (cards[id] !== undefined)
            return lang as SupportedLanguages;
    }


    return undefined;
}

function doSetExistNoDefault(lang: SupportedLanguages, id: string) : boolean {
    let sets = langData.sets[lang];

    if (sets === undefined) {
        return false;
    }

    return sets[id] !== undefined;
}

export function doSetExist(lang: SupportedLanguages, id: string, defaultLang: SupportedLanguages | undefined) : SupportedLanguages | undefined {
    if (doSetExistNoDefault(lang, id)) {
        return lang;
    }

    if (defaultLang !== undefined && doSetExistNoDefault(defaultLang, id)) {
        return defaultLang;
    }

    for (let [lang, sets] of Object.entries(langData.sets)) {
        if (sets[id] !== undefined)
            return lang as SupportedLanguages;
    }

    return undefined;
}

function doSerieExistNoDefault(lang: SupportedLanguages, id: string) : boolean {
    let series = langData.series[lang];

    if (series === undefined) {
        return false;
    }

    return series[id] !== undefined;
}

export function doSerieExist(lang: SupportedLanguages, id: string, defaultLang: SupportedLanguages | undefined) : SupportedLanguages | undefined {
    if (doSerieExistNoDefault(lang, id)) {
        return lang;
    }

    if (defaultLang !== undefined && doSerieExistNoDefault(defaultLang, id)) {
        return defaultLang;
    }

    for (let [lang, series] of Object.entries(langData.series)) {
        if (series[id] !== undefined)
            return lang as SupportedLanguages;
    }

    return undefined;
}

async function mkdir(path: PathLike) {
    try {
        await fs.mkdir(path);
    } catch {
    }
}

export async function serializeBackendData(outDir: string) {
    let promises: Array<Promise<any>> = []

    let backendDir = path.join(outDir, "backend");
    let langDir = path.join(outDir, "lang");

    await mkdir(backendDir);
    promises.push(fs.writeFile(path.join(backendDir, "sets.json"), JSON.stringify(backendData.sets), "utf-8"));
    promises.push(fs.writeFile(path.join(backendDir, "series.json"), JSON.stringify(backendData.series), "utf-8"));
    promises.push(fs.writeFile(path.join(backendDir, "cards.json"), JSON.stringify(backendData.cards), "utf-8"));
    
    await mkdir(langDir);
    for (let [lang, data] of Object.entries(langData.cards)) {
        let currLangDir = path.join(langDir, lang);
        await mkdir(currLangDir);
        promises.push(fs.writeFile(path.join(currLangDir, "cards.json"), JSON.stringify(data), "utf-8"));
    }

    for (let [lang, data] of Object.entries(langData.sets)) {
        let currLangDir = path.join(langDir, lang);
        await mkdir(currLangDir);
        promises.push(fs.writeFile(path.join(currLangDir, "sets.json"), JSON.stringify(data), "utf-8"));
    }

    for (let [lang, data] of Object.entries(langData.series)) {
        let currLangDir = path.join(langDir, lang);
        await mkdir(currLangDir);
        promises.push(fs.writeFile(path.join(currLangDir, "series.json"), JSON.stringify(data), "utf-8"));
    }

    Promise.all(promises);
}