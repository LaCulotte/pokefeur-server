import { DATABASE, GENERATED_DIR } from "../common/constants"
import { smartGlob } from './utils';
import { promises as fs } from 'fs';
import type { BackendData, CardData, SetData, SerieData } from "./interfaces"
import { getSerie } from './endpoints/series';
import { saveSerie, saveSerieLang, serializeBackendData } from './dataSingleton';

async function getData() : Promise<BackendData> {
    let files = await smartGlob(`./${DATABASE}/*.ts`);
    let ret: BackendData = {
        series: {},
        sets: {},
        cards: {}
    };

    let series = [];
    for (let file of files) {
        series.push(await getSerie(file));
    }

    series.sort((a, b) => { return a[0] >= b[0] ? 1 : -1; });

    for (let serie of series) {
        saveSerie(serie[1]);
        for (let serieLang of serie[2])  {
            saveSerieLang(serieLang);
        }
    }

    return ret;
}

await (async () => {
    try {
        await fs.mkdir(GENERATED_DIR);
    } catch {
    }

    await getData();

    await serializeBackendData(GENERATED_DIR);
})();
