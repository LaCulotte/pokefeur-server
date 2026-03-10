import type { SupportedLanguages } from "../../../resources/interfaces"

import { parse } from "csv-parse/sync";
import fs from "fs/promises";
import type { PokemonData } from "../interfaces";

const ID_TO_LANG: Record<number, Array<SupportedLanguages>> = {
    1: ["ja"],
    2: [],
    3: ["ko"],
    4: ["zh-tw"],
    5: ["fr"],
    6: ["de"],
    7: ["es", "es-mx"],
    8: ["it"],
    9: ["en", "nl", "pl", "ru", "id", "th"],
    10: [],
    11: ["ja"],
    12: ["zh-cn"],
    13: ["pt", "pt-pt", "pt-br"]
}

const POKEMON_ID_INDEX = 0;
const LANG_INDEX = 1;
const POKEMON_NAME_INDEX = 2;

export async function getPokemonData(path: string): Promise<PokemonData> {
    let csvData = await fs.readFile(path, "utf-8");
    let records = parse(csvData, {
        skip_empty_lines: true
    });
    
    let data: PokemonData = {};

    records.shift();
    for (let record of records) {
        if (record.length < 3) {
            console.warn(`Invalid record in pokemon csv : ${record}`);
            continue;
        }

        let id = parseInt(record[POKEMON_ID_INDEX]!);

        let langs = parseInt(record[LANG_INDEX]!);
        let langList = ID_TO_LANG[langs];
        if (langList === undefined) {
            console.warn(`Unknown language id '${langs}' for pokemon '${record[POKEMON_NAME_INDEX]}' !`);
            continue;
        }
        
        let name = record[POKEMON_NAME_INDEX]!;

        for (let lang of langList) {
            if (data[lang] === undefined) {
                data[lang] = {
                    id_to_name: {},
                    name_to_id: {}
                }
            }

            data[lang].id_to_name[id] = name;
            data[lang].name_to_id[name] = id;
        }
    }

    return data;
}
