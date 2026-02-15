import { Type } from "../../src/common/constants"

interface DealSchema {
    timeout: number,
    waittime: number,
    cost: {
        cards: {
            count: number,
            sets: Array<string> // Set ids
        },
        boosters: {
            count: number,
            sets: Array<string> // Set ids
        }
        energies: {
            count: number,
            types: Array<Type> // energy type
        }
    },
    rewards: {
        cards: Array<string>,
        boosters: Array<string>,
    }
}

type DealershipSchema = Record<string, DealSchema>;
