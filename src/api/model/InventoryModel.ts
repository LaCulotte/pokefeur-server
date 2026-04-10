import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

import type { FullUser, InventoryItem, InventoryItemT, ItemType, User } from "./interfaces";
import { StaticDataSingleton } from "../staticData/loader";
import { Expected, expected, unexpected } from "../../common/utils";
import { SUPPORTED_ENERGY_TYPES, Type } from "../../common/constants";

type InventoryDataStructure = FullUser["inventory"];

const DEFAULT_INVENTORY: InventoryDataStructure = {
    inTradeItems: {},
    items: {},
    energies: SUPPORTED_ENERGY_TYPES
                .reduce((acc, e) => (acc[e] = 0, acc), {} as InventoryDataStructure["energies"])
};

export class InventoryModel {
    user: User;
    data: InventoryDataStructure;

    constructor(user: User) {
        this.user = user;
        this.data = structuredClone(DEFAULT_INVENTORY);
    }

    static async createDirs() {
        await fs.mkdir("./data/inventories/", {
            recursive: true
        });
    }

    async loadUserInventory() {
        try {
            const parsed = JSON.parse(await fs.readFile(`./data/inventories/${this.user.uid}.json`, "utf-8")) as Partial<InventoryDataStructure>;

            this.data = {
                items: parsed.items ?? {},
                inTradeItems: parsed.inTradeItems ?? {},
                // Merge parsed values with defaults so every energy key is present
                energies: { ...(DEFAULT_INVENTORY.energies), ...(parsed.energies ?? {}) }
            };

            // TODO : sanatize inventories ?
        } catch (e) {
            console.warn(`Could not load inventory for user ${this.user.username} (uid: ${this.user.uid})`);
            this.data = structuredClone(DEFAULT_INVENTORY);

            await this.saveInventory();
        }
    }

    async saveInventory() {
        // TODO : We probably should await previous calls to this function. Should no longer be a problem when using proper databases
        await fs.writeFile(`./data/inventories/${this.user.uid}.json`, JSON.stringify(this.data ?? {}), "utf-8");
    }

    async addItemToInventory<T extends ItemType>(type: T, id: string) : Promise<Expected<InventoryItemT<T>>> {
        const staticData = StaticDataSingleton.getInstance();

        if (type == "booster") {
            if (!(id in staticData.staticData.sets)) {
                return unexpected(`Unknown set of id ${id}`, true);
            }
        } else if (type == "card") {
            if (!(id in staticData.staticData.cards)) {
                return unexpected(`Unknown card of id ${id}`, true);
            }
        } else {
            return unexpected(`Unkown type of item : ${type}`, true);
        }

        let itemUid = uuidv4();

        while (itemUid in this.data.items || itemUid in this.data.inTradeItems) {
            itemUid = uuidv4();
        }

        const item: InventoryItem = {
            type,
            id,
            uid: itemUid
        };

        this.data.items[itemUid] = item;

        await this.saveInventory();

        return expected(item as InventoryItemT<T>);
    }

    async removeItemFromInventory(itemUid: string) : Promise<Expected<InventoryItem>> {
        if (this.data.items[itemUid] === undefined) {
            return unexpected(`No item of uid ${itemUid} in the inventory of user ${this.user.uid}`, true);
        }

        const item = structuredClone(this.data.items[itemUid]);
        delete this.data.items[itemUid];

        await this.saveInventory();

        return expected(item);
    }

    async removeItemFromInventoryById(type: ItemType, id: string, n: number = 1) : Promise<Expected<Array<InventoryItem>>> {
        if (n == 0) {
            return expected([]);
        }

        const uidsToDelete = [];

        for (const [currUid, item] of Object.entries(this.data.items)) {
            if (id == item.id && type == item.type) {
                uidsToDelete.push(currUid);

                if (n > 0 && uidsToDelete.length >= n) {
                    break;
                }
            }
        }

        const deleted: Array<InventoryItem> = [];
        for (const uid of uidsToDelete) {
            deleted.push(structuredClone(this.data.items[uid]) as InventoryItem);
            delete this.data.items[uid];
        }

        await this.saveInventory();

        return expected(deleted);
    }

    async addEnergy(energyType: Type, n: number = 1): Promise<Expected<Type>> {
        if (!SUPPORTED_ENERGY_TYPES.includes(energyType)) {
            return unexpected(`Energy type ${energyType} is not currently supported`);
        }

        if (this.data.energies[energyType] === undefined) {
            this.data.energies[energyType] = 0;
        }

        this.data.energies[energyType] += n;

        await this.saveInventory();

        return expected(energyType);
    }

    async removeEnergy(energyType: Type, n: number = 1): Promise<Expected<Type>> {
        if (!SUPPORTED_ENERGY_TYPES.includes(energyType)) {
            return unexpected(`Energy type ${energyType} is not currently supported`);
        }

        if (this.data.energies[energyType] === undefined || this.data.energies[energyType] < n) {
            return unexpected(`Not enougth energy of type ${energyType} (expected ${n}; Got ${this.data.energies[energyType] ?? 0})`);
        }

        this.data.energies[energyType] -= n;

        await this.saveInventory();

        return expected(energyType);
    }

    async moveItemToTrade(itemUid: string) : Promise<Expected<InventoryItem>> {
        if (this.data.items[itemUid] === undefined) {
            if (this.data.inTradeItems[itemUid] !== undefined) {
                return unexpected(`No item of uid ${itemUid} is already used in a trade for the user ${this.user.uid}`, true);
            }

            return unexpected(`No item of uid ${itemUid} in the inventory of user ${this.user.uid}`, true);
        }
        
        this.data.inTradeItems[itemUid] = this.data.items[itemUid];
        delete this.data.items[itemUid];

        await this.saveInventory();

        return expected(this.data.inTradeItems[itemUid]);
    }

    async moveItemFromTrade(itemUid: string) : Promise<Expected<InventoryItem>> {
        if (this.data.inTradeItems[itemUid] === undefined) {
            return unexpected(`No item of uid ${itemUid} in the trade inventory of user ${this.user.uid}`, true);
        }
        
        this.data.items[itemUid] = this.data.inTradeItems[itemUid];
        delete this.data.inTradeItems[itemUid];
        
        await this.saveInventory();

        return expected(this.data.items[itemUid]);
    }

    async removeTradeItem(itemUid: string) : Promise<Expected<InventoryItem>> {
        if (this.data.inTradeItems[itemUid] === undefined) {
            return unexpected(`No item of uid ${itemUid} in the trade inventory of user ${this.user.uid}`, true);
        }

        const item = structuredClone(this.data.inTradeItems[itemUid]);
        delete this.data.inTradeItems[itemUid];

        await this.saveInventory();

        return expected(item);
    }
};