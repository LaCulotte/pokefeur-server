// Why is it located here ??

import { Type } from "../../src/common/constants";

interface DealSchema {
    timeout: number,
    waittime: number, // TODO : remove
    cost: Partial<{
        cards: {
            count: number,
            sets: Array<string> // Set ids
        },
        "cards-of-type": {
            count: number,
            types: Array<Type> // Card types
        },
        "cards-of-set": {
            count: number,
            sets: Array<string> // Set ids
        },
        "cards-of-pokemon": {
            count: number,
            sets: Array<string> // Set ids
        },
        boosters: {
            count: number,
            sets: Array<string> // Set ids
        }
        energies: {
            count: number,
            types: Array<Type> // Energy type
        }
    }>,
    rewards: {
        cards: Array<string>,
        boosters: Array<string>,
    }
}

type DealershipSchema = Record<string, DealSchema>;
