import type { ISODate, Serie as RawSerie, SupportedLanguages } from "../../../resources/interfaces"
import type { SerieData, SerieLangData, SetData } from "../interfaces";

import { doSetExist, saveSerie, saveSerieLang } from "../dataSingleton";
import { getSet } from "./sets";

import { getImportRelativePath } from "../../common/utils"
import { smartGlob, getLangOrDefault, forEachLang } from "../utils";

import path from "path"
import {fileURLToPath} from 'url';
import { promises as fs } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getSerie(filePath: string) : Promise<[string, SerieData, Array<SerieLangData>]> {
    // let rawSerie: RawSerie = await fs.readFile(filePath, "utf-8").then(data => JSON.parse(data));
    let rawSerie: RawSerie = (await import(path.join(getImportRelativePath(__dirname), filePath))).default;
    let serie = deserializeRawSerie(rawSerie);

    let enName = rawSerie.name.en;
    let serieDate: ISODate = "1970-1-1";

    if (enName !== undefined) {
        let setsGlobQuery = path.join(path.dirname(filePath), enName, "*.ts");

        let setsFiles = await smartGlob(setsGlobQuery);
        let setList: Array<[ISODate, string]> = [];
        for (let file of setsFiles) {
            let setData = await getSet(file);
            setList.push([setData.releaseDate, setData.id]);
        }
        
        setList.sort((a, b) => { return a[0] > b[0] ? 1 : -1 });

        serie.sets = setList.map(([date, id]) => id);
        serieDate = setList[0] ? setList[0][0] : "1970-1-1";
    } else {
        console.warn(`No english name for serie '${rawSerie.id}' ! Cannot find associated sets.`);
    }

    // saveSerie(serie);

    let serieLangs = forEachLang(getAvailableLangs(rawSerie),
        (lang: SupportedLanguages, defaultVal?: SerieLangData) => {
            return createSerieLang(rawSerie, serie, lang, defaultVal)
        }
    );

    return [serieDate, serie, serieLangs];
}

function deserializeRawSerie(data: RawSerie) : SerieData {
    let serie: SerieData = {
        id: data.id,
        sets: [],
    }

    return serie;
}

function getAvailableLangs(rawData: RawSerie) : Set<SupportedLanguages> {
    let ret: Set<SupportedLanguages> = new Set();

    Object.keys(rawData.name).forEach((key) => {ret.add(key as SupportedLanguages)});
    
    return ret;
}

function createSerieLang(rawData: RawSerie, serie: SerieData, lang: SupportedLanguages, defaultLangData?: SerieLangData) : SerieLangData {
    let name = rawData.name[lang] ?? defaultLangData?.name;
    if (name === undefined) {
        if (Object.values(rawData.name).length == 0)
            throw new Error(`No name for serie of id ${serie.id}`);
        name = Object.values(rawData.name)[0];
    }
    
    let langData: SerieLangData = {
        lang: lang,
        id: serie.id,
        name: name ?? "",
        sets: {}
    }

    for (let setId of serie.sets) {
        let setLang = doSetExist(lang, setId, defaultLangData?.lang);

        if (setLang === undefined) {
            throw new Error(`No lang available for set of id '${setId}' ??`);
        }

        langData.sets[setId] = setLang;
    }

    // saveSerieLang(langData);

    return langData;
}