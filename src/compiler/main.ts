import { DATABASE, GENERATED_DIR, POKEMON_NAMES_DATABASE } from "../common/constants"
import { smartGlob } from './utils';
import { promises as fs } from 'fs';
import type { BackendData, CardData, SetData, SerieData, PokemonData } from "./interfaces"
import { getSerie } from './endpoints/series';
import { saveSerie, saveSerieLang, serializeBackendData } from './dataSingleton';
import { getPokemonData } from "./endpoints/pokemon";
import path from "path"

async function getData() : Promise<BackendData> {
    const files = await smartGlob(`./${DATABASE}/*.ts`);
    const ret: BackendData = {
        series: {},
        sets: {},
        cards: {}
    };

    const series = [];
    for (const file of files) {
        series.push(await getSerie(file));
    }

    series.sort((a, b) => { return a[0] >= b[0] ? 1 : -1; });

    for (const serie of series) {
        saveSerie(serie[1]);
        for (const serieLang of serie[2])  {
            saveSerieLang(serieLang);
        }
    }

    return ret;
}

async function makePokemonData(dir: string) {
    const data = await getPokemonData(POKEMON_NAMES_DATABASE);

    await fs.writeFile(path.join(dir, "pokemons.json"), JSON.stringify(data));
}

await (async () => {
    try {
        await fs.mkdir(GENERATED_DIR);
    } catch {
    }

    await getData();

    await serializeBackendData(GENERATED_DIR);

    await makePokemonData(GENERATED_DIR);
})();
