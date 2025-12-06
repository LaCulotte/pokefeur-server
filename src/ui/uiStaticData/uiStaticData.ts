import type { StaticLangData } from "@/api/staticData/interfaces";

export class uiStaticDataSingleton {
    staticLangData: StaticLangData = {
        series: {},
        sets: {},
        cards: {},
    };

    private loaded: boolean = false;

    private static data: uiStaticDataSingleton = new uiStaticDataSingleton();

    static async load(lang: string) {
        // await fetch("/api/static/lang/")
    }

    static getInstance() : uiStaticDataSingleton {
        if (!this.data.loaded)
            throw new Error("Static data  not loaded !!");
        
        return this.data;
    }
}