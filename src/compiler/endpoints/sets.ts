import type { Set as RawSet, SupportedLanguages, ISODate } from "../../../resources/interfaces"
import type { SetData, SetLangData } from "../interfaces";

import { doCardExist, saveSet, saveSetLang } from "../dataSingleton";
import { getCard } from "./cards";

import { getImportRelativePath } from "../../common/utils"
import { smartGlob, getLangOrDefault, forEachLang, getPicture } from "../utils";

import path from "path"
import {fileURLToPath} from 'url';
import { promises as fs } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getSet(filePath: string) : Promise<SetData> {
    // let rawSet: RawSet = await fs.readFile(filePath, "utf-8").then(data => JSON.parse(data));
    let rawSet: RawSet = (await import(path.join(getImportRelativePath(__dirname), filePath))).default;
    let set = deserializeRawSet(rawSet);

    let enName = rawSet.name.en;
    if (enName !== undefined) {
        let cardsGlobQuery = path.join(path.dirname(filePath), enName, "*.ts");
    
        let cardsFiles = await smartGlob(cardsGlobQuery);
        let cardList: Array<[number, string]> = [];
        for (let file of cardsFiles) {
            let cardData = await getCard(file);
            cardList.push([parseInt(cardData.localId), cardData.id]);
        }

        set.cards = cardList.sort((cardA, cardB) => { return cardA[0] >= cardB[0] ? 1 : -1; }).map(([localId, id]) => id);
    } else {
        console.log(`No english name for set '${rawSet.id}'. Cannot find associated cards.`);
    }

    set.cardCount.total = set.cards.length;

    saveSet(set);

    forEachLang(getAvailableLangs(rawSet),
        (lang: SupportedLanguages, defaultVal?: SetLangData) => {
            return createSetLang(rawSet, set, lang, defaultVal)
        }
    );

    return set;
}

function getReleaseDate(data: RawSet, lang: SupportedLanguages = "en") : ISODate {
    if (typeof data.releaseDate === 'object') {
        if (data.releaseDate[lang] !== undefined) {
            return data.releaseDate[lang];
        }

        return Object.values(data.releaseDate)[0] ?? "1970-1-1";
    } else {
        return data.releaseDate;
    }
}

function deserializeRawSet(data: RawSet) : SetData {
    // Ajouter le total de cartes (officiel + réel)
    let set: SetData = {
        id: data.id,
        serieId: data.serie.id,
        releaseDate: getReleaseDate(data),
        releaseDateTs: Date.parse(getReleaseDate(data)),
        cardCount: {
            official: data.cardCount.official,
            total: 0,
        },
        cards: [],
    }

    console.log(set.id)
    return set;
}

function getAvailableLangs(rawData: RawSet) : Set<SupportedLanguages> {
    let ret: Set<SupportedLanguages> = new Set();

    Object.keys(rawData.name).forEach((key) => {ret.add(key as SupportedLanguages)});
    
    return ret;
}

function createSetLang(rawData: RawSet, set: SetData, lang: SupportedLanguages, defaultLangData?: SetLangData) : SetLangData {
    let name = rawData.name[lang] ?? defaultLangData?.name;
    if (name === undefined) {
        if (Object.values(rawData.name).length == 0)
            throw new Error(`No name for set of id ${set.id}`);
        name = Object.values(rawData.name)[0];
    }

    // Ajouter le total de cartes (officiel + réel)
    let langData: SetLangData = {
        lang: lang,
        id: set.id,
        serieId: set.serieId,
        releaseDate: getReleaseDate(rawData, lang),
        releaseDateTs: Date.parse(getReleaseDate(rawData, lang)),
        cardCount: {
            official: rawData.cardCount.official,
            total: 0,
        },
        name: name ?? "",
        cards: {},
        logo: getPicture(set.serieId, set.id, "logo", lang, defaultLangData?.lang),
        symbol: defaultLangData?.symbol ?? getPicture(set.serieId, set.id, "symbol", "univ"),
    }

    for (let cardId of set.cards) {
        let cardLang = doCardExist(lang, cardId, defaultLangData?.lang);

        if (cardLang === undefined) {
            throw new Error(`No lang available for card of id '${cardId}' ??`);
        }

        langData.cards[cardId] = cardLang;
    }

    langData.cardCount.total = Object.keys(langData.cards).length;
    saveSetLang(langData);

    return langData
}