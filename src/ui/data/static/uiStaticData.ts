import type { StaticLangDataStore } from "@/api/staticData/interfaces";
import type { SupportedLanguages } from "../../../../resources/interfaces";
import type { PokemonData } from "@/compiler/interfaces";

export class UiStaticDataSingleton {
    staticLangDataStore: StaticLangDataStore = {};
    pokemonData: PokemonData = {};

    private loaded: boolean = false;

    private static data: UiStaticDataSingleton = new UiStaticDataSingleton();

    static async load(lang: SupportedLanguages) : Promise<string | undefined> {
        const staticLangData = await fetch(`/api/static/lang/${lang}`)
                .then((res) => {
                    if (res.status != 200) {
                        return undefined;
                    } else {
                        return res.json()
                    }
                });

        if (staticLangData === undefined) {
            return "Unknown data !";
        }

        this.data.staticLangDataStore[lang] = staticLangData;

        const pokemonData = await fetch(`/api/static/pokemons`)
                .then((res) => {
                    if (res.status != 200) {
                        return undefined;
                    } else {
                        return res.json()
                    }
                });
                
        if (pokemonData === undefined) {
            return "Unknown data !";
        }
        this.data.pokemonData = pokemonData;

        this.data.loaded = true;
    }

    static getInstance() : UiStaticDataSingleton {
        if (!this.data.loaded)
            throw new Error("Static data  not loaded !!");
        
        return this.data;
    }
}