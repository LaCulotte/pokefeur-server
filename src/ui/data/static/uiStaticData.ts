import type { StaticLangDataStore } from "@/api/staticData/interfaces";
import type { SupportedLanguages } from "../../../../resources/interfaces";

export class UiStaticDataSingleton {
    staticLangDataStore: StaticLangDataStore = {};

    private loaded: boolean = false;

    private static data: UiStaticDataSingleton = new UiStaticDataSingleton();

    static async load(lang: SupportedLanguages) : Promise<string | undefined> {
        let data = await fetch(`/api/static/lang/${lang}`)
                .then((res) => {
                    if (res.status != 200) {
                        return undefined;
                    } else {
                        return res.json()
                    }
                });

        if (data === undefined) {
            return "Unknown data !";
        }

        this.data.staticLangDataStore[lang] = data;
        this.data.loaded = true;
    }

    static getInstance() : UiStaticDataSingleton {
        if (!this.data.loaded)
            throw new Error("Static data  not loaded !!");
        
        return this.data;
    }
}