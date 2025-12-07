import type { CardData, CardLangData, SerieData, SerieLangData, SetData, SetLangData } from "../../compiler/interfaces";
import type { SerieStaticData, SerieStaticLangData, SetStaticData, SetStaticLangData, CardStaticLangData } from "./interfaces";

import type { StaticData, StaticLangData } from "./interfaces";

import { LANGS, GENERATED_DIR } from "../../common/constants";
import { getImportRelativePath } from "../../common/utils";

import path from "path"
import {fileURLToPath} from 'url';
import type { SupportedLanguages } from "../../../resources/interfaces";

import fs from "fs/promises";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WorkingLangData {
    sets: Record<string, Array<[string, SupportedLanguages]>>
    series: Record<string, Array<[string, SupportedLanguages]>>
};

export class StaticDataSingleton {
    staticData: StaticData = {
        series: {},
        sets: {},
        cards: {},
    };

    staticLangData: StaticLangData = {};

    private loaded: boolean = false;

    private static data: StaticDataSingleton = new StaticDataSingleton();

    static async load() {
        await this.data.loadStaticData();

        let workingData: Partial<Record<SupportedLanguages, WorkingLangData>> = {}
        for (let lang of LANGS) {
            // TODO : promise.all
            workingData[lang] = await this.data.loadStaticLangData(lang);
        }

        for (let [lang, wdata] of Object.entries(workingData)) {
            await this.data.linkStaticLangData(lang as SupportedLanguages, wdata);
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
        let cards: Record<string, CardData> =
            await fs.readFile(path.join(GENERATED_DIR, "backend", "cards.json"), "utf-8").then(data => JSON.parse(data));

        this.staticData.cards = cards;

        // Load sets
        let sets: Record<string, SetData> =
            // (await import(path.join(getImportRelativePath(__dirname), GENERATED_DIR, "backend", "sets.json"))).default;
            await fs.readFile(path.join(GENERATED_DIR, "backend", "sets.json"), "utf-8").then(data => JSON.parse(data));


        for (let [id, set] of Object.entries(sets)) {
            let staticSet: SetStaticData = {
                ...set,
                cards: {}
            }

            for (let cardId of set.cards) {
                let card = this.staticData.cards[cardId]
                if (card !== undefined) {
                    staticSet.cards[cardId] = card;
                } else {
                    console.warn(`Unkown card of id '${cardId}'`);
                }
            }

            this.staticData.sets[id] = staticSet;
        }

        // Load series
        let series: Record<string, SerieData> =
            // (await import(path.join(getImportRelativePath(__dirname), GENERATED_DIR, "backend", "series.json"))).default;
            await fs.readFile(path.join(GENERATED_DIR, "backend", "series.json"), "utf-8").then(data => JSON.parse(data));


        for (let [id, serie] of Object.entries(series)) {
            let staticSet: SerieStaticData = {
                ...serie,
                sets: {}
            }

            for (let setId of serie.sets) {
                let set = this.staticData.sets[setId]
                if (set !== undefined) {
                    staticSet.sets[setId] = set;
                } else {
                    console.warn(`Unkown set of id '${setId}'`);
                }
            }

            this.staticData.series[id] = staticSet;
        }
    }

    private async loadStaticLangData(lang: SupportedLanguages) : Promise<WorkingLangData> {
        let workingData: WorkingLangData = {
            sets: {},
            series: {}
        };

        let langData = {
            series: {} as Record<string, SerieStaticLangData>,
            sets: {} as Record<string, SetStaticLangData>,
            cards: {} as Record<string, CardStaticLangData>
        };
        
        // Load lang cards
        let cards: Record<string, CardLangData> =
            // (await import(path.join(getImportRelativePath(__dirname), GENERATED_DIR, "lang", lang, "cards.json"))).default;
            await fs.readFile(path.join(GENERATED_DIR, "lang", lang, "cards.json"), "utf-8").then(data => JSON.parse(data));

        // this.staticLangData.cards[lang] = cards;
        langData.cards = cards;

        // Load lang sets
        let sets: Record<string, SetLangData> =
            // (await import(path.join(getImportRelativePath(__dirname), GENERATED_DIR, "lang", lang, "sets.json"))).default;
            await fs.readFile(path.join(GENERATED_DIR, "lang", lang, "sets.json"), "utf-8").then(data => JSON.parse(data));

        // this.staticLangData.sets[lang] = {};
        // let langSets = this.staticLangData.sets[lang];

        for (let [id, set] of Object.entries(sets)) {
            let staticSet: SetStaticLangData = {
                ...set,
                cards: {}
            }

            workingData.sets[id] = Object.entries(set.cards);

            langData.sets[id] = staticSet;
        }


        // Load lang series
        let series: Record<string, SerieLangData> =
            // (await import(path.join(getImportRelativePath(__dirname), GENERATED_DIR, "lang", lang, "series.json"))).default;
            await fs.readFile(path.join(GENERATED_DIR, "lang", lang, "series.json"), "utf-8").then(data => JSON.parse(data));

        // this.staticLangData.series[lang] = {};
        // let langSeries = this.staticLangData.series[lang];

        for (let [id, serie] of Object.entries(series)) {
            let staticSet: SerieStaticLangData = {
                ...serie,
                sets: {}
            }

            workingData.series[id] = Object.entries(serie.sets);

            langData.series[id] = staticSet;
        }

        this.staticLangData[lang] = langData;

        return workingData;
    }

    private async linkStaticLangData(lang: SupportedLanguages, workingData: WorkingLangData) {
        let langData = this.staticLangData[lang];

        if (langData === undefined) {
            console.error(`No lang ${lang} ?`);
            return;
        }

        // Link cards in sets
        for (let [setId, cards] of Object.entries(workingData.sets)) {
            let set = langData.sets[setId];
            if (set === undefined) {
                console.warn(`No set ${setId} for lang ${lang} !`)
                continue;
            }

            for (let [cardId, cardLang] of cards) {
                let currLangCards = this.staticLangData[cardLang]?.cards;
                if (currLangCards === undefined) {
                    console.warn(`Unkown lang '${cardLang}' for cards`);
                    continue;
                }

                let card = currLangCards[cardId];
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


        // Link set in series
        for (let [serieId, sets] of Object.entries(workingData.series)) {
            let serie = langData.series[serieId];
            if (serie === undefined) {
                console.warn(`No serie ${serieId} for lang ${lang} !`)
                continue;  
            }

            for (let [setId, setLang] of sets) {
                let currLangSets = this.staticLangData[setLang]?.sets;
                if (currLangSets === undefined) {
                    console.warn(`Unkown lang '${setLang}' for sets`);
                    continue;
                }

                let set = currLangSets[setId]
                if (set !== undefined) {
                    serie.sets[setId] = set;

                    if (setLang !== lang) {
                        langData.sets[setId] = set;

                        for (let [cardId, card] of Object.entries(set.cards)) {
                            langData.cards[cardId] = card;
                        }
                    }
                } else {
                    console.warn(`Unkown set of id '${setId}'`);
                }
            }
        }
    }
};
