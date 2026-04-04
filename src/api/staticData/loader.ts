import type { CardData, CardLangData, SerieData, SerieLangData, SetData, SetLangData } from "../../compiler/interfaces";
import type { SerieStaticData, SerieStaticLangData, SetStaticData, SetStaticLangData, CardStaticLangData } from "./interfaces";

import type { StaticData, StaticLangDataStore } from "./interfaces";

import { LANGS, GENERATED_DIR } from "../../common/constants";
import { getImportRelativePath } from "../../common/utils";

import path from "path"
import {fileURLToPath} from 'url';
import type { SupportedLanguages } from "../../../resources/interfaces";

import fs from "fs/promises";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WorkingLangData {
    sets: Record<string, Array<[string, SupportedLanguages]>>       // set id => [card id, lang]
    series: Record<string, Array<[string, SupportedLanguages]>>     // serie id => [set id, lang]
    missingSeriesList: Array<[string, SupportedLanguages]>                 // [serie id, lang]
};

export class StaticDataSingleton {
    staticData: StaticData = {
        series: {},
        sets: {},
        cards: {},
    };

    staticLangDataStore: StaticLangDataStore = {};

    private loaded: boolean = false;

    private static data: StaticDataSingleton = new StaticDataSingleton();

    static async load() {
        await this.data.loadStaticData();

        const workingData: Partial<Record<SupportedLanguages, WorkingLangData>> = {}
        for (const lang of LANGS) {
            // TODO : promise.all to 'semi-parallelize'
            workingData[lang] = await this.data.loadStaticLangDataStore(lang);
        }

        const series: Array<string> = Object.keys(this.data.staticData.series);
        const seriesLangs: Array<[string, SupportedLanguages]> = series.map((id) => {
            if (this.data.staticLangDataStore.en?.series[id] !== undefined) {
                return [id, "en"];
            }

            for (const [lang, sdata] of Object.entries(this.data.staticLangDataStore)) {
                if (sdata.series[id] !== undefined)
                    return [id, lang as SupportedLanguages];
            }

            console.warn(`Serie ${id} does not have any langage ?`);
            return [id, "en"];
        });

        for (const [lang, wdata] of Object.entries(workingData)) {
            await this.data.linkSetsLangData(lang as SupportedLanguages, wdata);
        }

        for (const [lang, wdata] of Object.entries(workingData)) {
            await this.data.linkSeriesLangData(lang as SupportedLanguages, wdata);
        }

        for (const [wlang, wdata] of Object.entries(workingData)) {
            for (const [id, lang] of seriesLangs) {
                if (!(id in wdata.series)) {
                    await this.data.linkMissingSeriesLangData(wlang as SupportedLanguages, id, lang); 
                }
            }
        }

        this.data.loaded = true;
    }

    static getInstance() : StaticDataSingleton {
        if (!this.data.loaded)
            throw new Error("Static data  not loaded !!");
        
        return this.data;
    }

    // -- Load functions --

    private async loadStaticData() {
        // Load cards
        const cards: Record<string, CardData> =
            await fs.readFile(path.join(GENERATED_DIR, "backend", "cards.json"), "utf-8").then(data => JSON.parse(data));

        this.staticData.cards = cards;

        // Load sets
        const sets: Record<string, SetData> =
            // (await import(path.join(getImportRelativePath(__dirname), GENERATED_DIR, "backend", "sets.json"))).default;
            await fs.readFile(path.join(GENERATED_DIR, "backend", "sets.json"), "utf-8").then(data => JSON.parse(data));


        for (const [id, set] of Object.entries(sets)) {
            const staticSet: SetStaticData = {
                ...set,
                cards: {}
            }

            for (const cardId of set.cards) {
                const card = this.staticData.cards[cardId]
                if (card !== undefined) {
                    staticSet.cards[cardId] = card;
                } else {
                    console.warn(`Unkown card of id '${cardId}'`);
                }
            }

            this.staticData.sets[id] = staticSet;
        }

        // Load series
        const series: Record<string, SerieData> =
            // (await import(path.join(getImportRelativePath(__dirname), GENERATED_DIR, "backend", "series.json"))).default;
            await fs.readFile(path.join(GENERATED_DIR, "backend", "series.json"), "utf-8").then(data => JSON.parse(data));


        for (const [id, serie] of Object.entries(series)) {
            const staticSet: SerieStaticData = {
                ...serie,
                sets: {}
            }

            for (const setId of serie.sets) {
                const set = this.staticData.sets[setId]
                if (set !== undefined) {
                    staticSet.sets[setId] = set;
                } else {
                    console.warn(`Unkown set of id '${setId}'`);
                }
            }

            this.staticData.series[id] = staticSet;
        }
    }

    private async loadStaticLangDataStore(lang: SupportedLanguages) : Promise<WorkingLangData> {
        const workingData: WorkingLangData = {
            sets: {},
            series: {},
            missingSeriesList: []
        };

        const langData = {
            series: {} as Record<string, SerieStaticLangData>,
            sets: {} as Record<string, SetStaticLangData>,
            cards: {} as Record<string, CardStaticLangData>
        };
        
        // Load lang cards
        const cards: Record<string, CardLangData> =
            // (await import(path.join(getImportRelativePath(__dirname), GENERATED_DIR, "lang", lang, "cards.json"))).default;
            await fs.readFile(path.join(GENERATED_DIR, "lang", lang, "cards.json"), "utf-8").then(data => JSON.parse(data));

        // this.staticLangDataStore.cards[lang] = cards;
        langData.cards = cards;

        // Load lang sets
        const sets: Record<string, SetLangData> =
            // (await import(path.join(getImportRelativePath(__dirname), GENERATED_DIR, "lang", lang, "sets.json"))).default;
            await fs.readFile(path.join(GENERATED_DIR, "lang", lang, "sets.json"), "utf-8").then(data => JSON.parse(data));

        // this.staticLangDataStore.sets[lang] = {};
        // let langSets = this.staticLangDataStore.sets[lang];

        for (const [id, set] of Object.entries(sets)) {
            const staticSet: SetStaticLangData = {
                ...set,
                cards: {}
            }

            workingData.sets[id] = Object.entries(set.cards);

            langData.sets[id] = staticSet;
        }


        // Load lang series
        const series: Record<string, SerieLangData> =
            // (await import(path.join(getImportRelativePath(__dirname), GENERATED_DIR, "lang", lang, "series.json"))).default;
            await fs.readFile(path.join(GENERATED_DIR, "lang", lang, "series.json"), "utf-8").then(data => JSON.parse(data));

        // this.staticLangDataStore.series[lang] = {};
        // let langSeries = this.staticLangDataStore.series[lang];

        for (const [id, serie] of Object.entries(series)) {
            const staticSet: SerieStaticLangData = {
                ...serie,
                sets: {}
            }

            workingData.series[id] = Object.entries(serie.sets);

            langData.series[id] = staticSet;
        }

        this.staticLangDataStore[lang] = langData;

        return workingData;
    }

    private async linkSetsLangData(lang: SupportedLanguages, workingData: WorkingLangData) {
        const langData = this.staticLangDataStore[lang];

        if (langData === undefined) {
            console.error(`No lang ${lang} ?`);
            return;
        }

        for (const [setId, cards] of Object.entries(workingData.sets)) {
            const set = langData.sets[setId];
            if (set === undefined) {
                console.warn(`No set ${setId} for lang ${lang} !`)
                continue;
            }

            for (const [cardId, cardLang] of cards) {
                const currLangCards = this.staticLangDataStore[cardLang]?.cards;
                if (currLangCards === undefined) {
                    console.warn(`Unkown lang '${cardLang}' for cards`);
                    continue;
                }

                const card = currLangCards[cardId];
                if (card !== undefined) {
                    set.cards[cardId] = card;

                    if (cardLang !== lang) {
                        langData.cards[cardId] = card;
                    }

                } else {
                    console.warn(`Unkown card of id '${cardId}' for lang '${cardLang}' !`);
                }
            }
        }
    }

    private async linkSeriesLangData(lang: SupportedLanguages, workingData: WorkingLangData) {
        const langData = this.staticLangDataStore[lang];

        if (langData === undefined) {
            console.error(`No lang ${lang} ?`);
            return;
        }

        for (const [serieId, sets] of Object.entries(workingData.series)) {
            const serie = langData.series[serieId];
            if (serie === undefined) {
                console.warn(`No serie ${serieId} for lang ${lang} !`)
                continue;  
            }

            for (const [setId, setLang] of sets) {
                const currLangSets = this.staticLangDataStore[setLang]?.sets;
                if (currLangSets === undefined) {
                    console.warn(`Unkown lang '${setLang}' for sets`);
                    continue;
                }

                const set = currLangSets[setId]
                if (set !== undefined) {
                    serie.sets[setId] = set;

                    if (setLang !== lang) {
                        langData.sets[setId] = set;

                        for (const [cardId, card] of Object.entries(set.cards)) {
                            langData.cards[cardId] = card;
                        }

                        // Technically this could work, but only if linkSeriesLangData is called BEFORE loadStaticLangData
                        //      Not done to avoid mistakes, but kept as relic
                        // workingData.sets[setId] = Object.keys(set.cards).map((key) => [key, setLang])
                    }
                } else {
                    console.warn(`Unkown set of id '${setId}'`);
                }
            }
        }
    }

    private async linkMissingSeriesLangData(lang: SupportedLanguages, serieId: string, destLang: SupportedLanguages) {
        const langData = this.staticLangDataStore[lang];

        if (langData === undefined) {
            console.error(`No lang ${lang} ?`);
            return;
        }

        const destSerie = this.staticLangDataStore[destLang]?.series[serieId];
        if (destSerie === undefined) {
            console.error(`No serie ${serieId} or lang ${destLang}`);
            return;
        }

        langData.series[serieId] = destSerie;

        for (const [setId, set] of Object.entries(destSerie.sets)) {
            langData.sets[setId] = set;

            for (const [cardId, card] of Object.entries(set.cards)) {
                langData.cards[cardId] = card;
            }
        }
    }
};
