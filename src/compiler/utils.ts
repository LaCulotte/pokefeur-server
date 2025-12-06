import type { SupportedLanguages } from "../../resources/interfaces";

import { LANGS, DEFAULT_LANG, ALL_LANGS } from "../common/constants";

import { DATABASE } from "../common/constants";
import { glob } from "glob";

import { promises as fs } from "fs";
// import path from "path";


// export const IMPORT_RELATIVE_PATH = path.relative(__dirname, process.cwd());
// export function getImportRelativePath(dirname: string) { return path.relative(dirname, process.cwd()) }

const globCache: Record<string, Array<string>> = {}


// File containing info about card pictures
// const file = await fetch('https://assets.tcgdex.net/datas.json', { signal: signal.signal})
//                 .then((res) => { return res.json() });

// Reads DATABASE/datas.json using JSON.parse. If too old, re-fetches it from tcgdex
const file = await fs.stat(`${DATABASE}/datas.json`).then((stats) => {
        const now = new Date();
        const mtime = new Date(stats.mtime);
        const ageInHours = (now.getTime() - mtime.getTime()) / (
            1000 * 60 * 60
        );

        if (ageInHours > 24) {
            throw new Error("Old file");
        }
    }).then(async () => {
        console.log("Reading local datas.json");
        const data = await fs.readFile(`${DATABASE}/datas.json`, "utf-8");
        return JSON.parse(data);
    }).catch(async () => {
        console.log("Fetching new datas.json from tcgdex");

        const signal = new AbortController()

        const finished = setTimeout(() => {
            signal.abort()
        }, 60 * 1000);
        
        const data = await fetch('https://assets.tcgdex.net/datas.json', {
            signal: signal.signal
        }).then((res) => { return res.json() });
        
        clearTimeout(finished)

        await fs.writeFile(
            `${DATABASE}/datas.json`,
            JSON.stringify(data),
            "utf-8"
        );

        console.log("Done");
        
        return data;
    });

export async function smartGlob(query: string) : Promise<Array<string>> {
    if (!globCache[query]) {
        globCache[query] = await glob(query)
    }
    return globCache[query]
}

export function forEachLang<Type>(allLangs: Set<SupportedLanguages>, callback: (lang: SupportedLanguages, defaultVal?: Type) => Type) : Array<Type> {
    if (allLangs.size == 0) {
        console.error("What the hell ?");
    }
    
    let defaultLang: SupportedLanguages = DEFAULT_LANG;
    if (!allLangs.has(DEFAULT_LANG)) {
        for (let l of allLangs.values()) {
            defaultLang = l;
            break;
        }
    }
    
    let defaultValue = callback(defaultLang);
    let ret: Array<Type> = [ defaultValue ];

    for (let lang of LANGS) {
        if (allLangs.has(lang) && lang != defaultLang) {
            ret.push(callback(lang, defaultValue));
        }
    }

    return ret;
}

export function getLangOrDefault() {}


function pictureExists(serieId: string, setId: string, localId: string, lang: SupportedLanguages | "univ") : string | undefined {
    const pictureExists = Boolean(file[lang]?.[serieId]?.[setId]?.[localId]);

    if (pictureExists) {
        return `https://assets.tcgdex.net/${lang}/${serieId}/${setId}/${localId}`;
    }
    
    return undefined;
}

export function getPicture(serieId: string, setId: string, localId: string, lang: SupportedLanguages | "univ", defaultLang?: SupportedLanguages) : string {
    let langPic = pictureExists(serieId, setId, localId, lang);
    if (langPic !== undefined) {
        return langPic
    }

    if (defaultLang !== undefined) {
        let defaultPic = pictureExists(serieId, setId, localId, defaultLang);
        if (defaultPic !== undefined) {
            return defaultPic;
        }
    }

    for (let testLang of ALL_LANGS) {
        if (testLang != lang && testLang != defaultLang) {
            let testPic = pictureExists(serieId, setId, localId, testLang);
            if (testPic != undefined) {
                return testPic;
            }
        }
    }

    return "";
}

export function stringToEnum<Type>(enumObj: Record<string, Type>, value: string, defaultValue: Type, enumName?: string) : Type {
    let val = enumObj[value];
    if (val !== undefined) {
        return val;
    }

    if (enumName !== undefined) {
        console.warn(`Value '${value}' not found in enum '${enumName}'.`);
    }

    return defaultValue;
}

// export function getLangOrDefault<Type>(rawData: any, lang: SupportedLanguages, defaultLang?: SupportedLanguages, defaultConst: Type | undefined = undefined) : Type {
//     if (rawData !== undefined) {
//         return rawData;
//     }

//     if (defaultLang !== undefined) {
//         return defaultLang;
//     }

//     if (defaultConst !== undefined) {
//         return defaultConst;
//     }

//     throw new Error("No param available ??");
// }

// export function getLangOrDefault2<Type1, Type2>(rawData: Type1 | undefined, defaultStruct: Type2 | undefined, key: string, defaultConst: Type1 | undefined = undefined) : Type1 {
//     if (rawData !== undefined) {
//         return rawData;
//     }

//     if (defaultStruct !== undefined && defaultStruct !== null && defaultStruct[key as keyof Type2] !== undefined) {
//         return defaultStruct[key as keyof Type2] as Type1;
//     }

//     if (defaultConst !== undefined) {
//         return defaultConst;
//     }

//     throw new Error("Param X is missing");
// }
