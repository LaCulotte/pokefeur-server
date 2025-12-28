import fs from "fs/promises"
import { v4 as uuidv4 } from "uuid"

import type { FullUser, InventoryItem, InventoryItemT, ItemType, User, UserType } from "./interfaces"
import { StaticDataSingleton } from "../staticData/loader";
import { Expected, expected, unexpected } from "../../common/utils";

export class InventoryModel {
    user: User
    data: Record<string, InventoryItem>

    constructor(user: User) {
        this.user = user;
        this.data = {}
    }
    
    static async createDirs() {
        await fs.mkdir("./data/inventories/", {
            recursive: true
        });
    }

    async loadUserInventory() {
        try {
            this.data = await fs.readFile(`./data/inventories/${this.user.uid}.json`, "utf-8").then((data) => { return JSON.parse(data) });

            // TODO : sanatize inventories ?
        } catch (e) {
            console.warn(`Could not load inventory for user ${this.user.username} (uid: ${this.user.uid})`);
            this.data = {};

            this.saveInventory();
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

        while (itemUid in this.data) {
            itemUid = uuidv4();
        }

        let item: InventoryItem = {
            type,
            id,
            uid: itemUid
        }

        this.data[itemUid] = item;

        await this.saveInventory();

        return expected(item as InventoryItemT<T>);
    }

    async removeItemFromInventory(itemUid: string) : Promise<Expected<InventoryItem>> {
        if (this.data[itemUid] === undefined) {
            return unexpected(`No item of uid ${itemUid} in the inventory of user ${this.user.uid}`, true);
        }

        let item = structuredClone(this.data[itemUid]);
        delete this.data[itemUid];

        await this.saveInventory();

        return expected(item);
    }

    async removeItemFromInventoryById(type: ItemType, id: string, n: number = -1) : Promise<Expected<Array<InventoryItem>>> {
        if (n == 0) {
            return expected([]);
        }

        let uidsToDelete = []

        for (let [currUid, item] of Object.entries(this.data)) {
            if (id == item.id && type == item.type) {
                uidsToDelete.push(currUid);

                if (n > 0 && uidsToDelete.length >= n) {
                    break;
                }
            }
        }

        let deleted: Array<InventoryItem> = [];
        for (let uid of uidsToDelete) {
            deleted.push(structuredClone(this.data[uid]) as InventoryItem);
            delete this.data[uid];
        }

        await this.saveInventory();

        return expected(deleted);
    }
};