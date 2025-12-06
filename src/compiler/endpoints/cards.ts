import type { Card as RawCard, SupportedLanguages } from "../../../resources/interfaces"
import type { CardData, CardLangData } from "../interfaces";
import { CategoryMap, Category, TypeMap, Type, StageMap, Stage, SuffixMap, Suffix, RarityMap, Rarity, TrainerTypeMap, TrainerType } from "../../common/constants";

import { saveCard, saveCardLang } from "../dataSingleton";

import { getImportRelativePath } from "../../common/utils"

import { getPicture, forEachLang, stringToEnum } from "../utils";

import path from "path"
import {fileURLToPath} from 'url';
import { promises as fs } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getCard(filePath: string) : Promise<CardData> {
    // let rawCard: RawCard = await fs.readFile(filePath, "utf-8").then(data => JSON.parse(data));;
    let rawCard: RawCard = (await import(path.join(getImportRelativePath(__dirname), filePath))).default;
    let localId = path.basename(filePath, ".ts");

    let card = deserializeRawCard(rawCard, localId);

    saveCard(card);

    forEachLang(getAvailableLangs(rawCard),
        (lang: SupportedLanguages, defaultVal?: CardLangData) => {
            return createCardLang(rawCard, card, lang, defaultVal)
        }
    );

    return card;
}

function deserializeRawCard(data: RawCard, localId: string) : CardData {
    let card: CardData = {
        id:  `${data.set.id}-${localId}`,
        setId: data.set.id,
        localId: localId,
        name: data.name.en ?? "No name",

        category: stringToEnum(CategoryMap, data.category, Category.UNDEFINED, "category"),
        rarity: stringToEnum(RarityMap, data.rarity, Rarity.UNDEFINED, "rarity"),
        types: data.types !== undefined ? data.types.map((type) => stringToEnum(TypeMap, type, Type.UNDEFINED, "type")) : undefined,
        stage: data.stage !== undefined ? stringToEnum(StageMap, data.stage, Stage.UNDEFINED, "stage") : undefined,
        suffix: data.suffix !== undefined ? stringToEnum(SuffixMap, data.suffix, Suffix.UNDEFINED, "suffix") : undefined,
        trainerType: data.trainerType !== undefined ? stringToEnum(TrainerTypeMap, data.trainerType, TrainerType.UNDEFINED, "trainerType") : undefined,
        dexId: data.dexId,
    };

    return card;
}

function getAvailableLangs(rawData: RawCard) : Set<SupportedLanguages> {
    let ret: Set<SupportedLanguages> = new Set();

    Object.keys(rawData.name).forEach((key) => {ret.add(key as SupportedLanguages)});
    
    return ret;
}

function createCardLang(rawData: RawCard, card: CardData, lang: SupportedLanguages, defaultLangData?: CardLangData) : CardLangData {
    let name = rawData.name[lang] ?? defaultLangData?.name;
    if (name === undefined) {
        if (Object.values(rawData.name).length == 0)
            throw new Error(`No name for card of id ${card.id}`);
        name = Object.values(rawData.name)[0];
    }
    
    let description = rawData.description?.[lang] ?? defaultLangData?.description;
    if (description === undefined) {
        if (rawData.description !== undefined && Object.values(rawData.description).length > 0)
            description = Object.values(rawData.description)[0];
    }

    let langData: CardLangData = {
        lang: lang,
        id: card.id,
        name: name ?? "",
        setId: card.setId,
        localId: card.localId,
        image: getPicture(rawData.set.serie.id, rawData.set.id, card.localId, lang, defaultLangData?.lang),
        description: description,
        
        category: card.category,
        rarity: card.rarity,

        types: card.types,
        stage: card.stage,
        suffix: card.suffix,
        dexId: card.dexId,
        trainerType: card.trainerType,
    }

    saveCardLang(langData);

    return langData
}