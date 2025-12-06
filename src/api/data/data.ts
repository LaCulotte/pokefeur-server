import fs from "fs/promises"
import { v4 as uuidv4 } from "uuid"

import type { InventoryItem, ItemType, User, UserType } from "./interfaces"
import { StaticDataSingleton } from "../staticData/loader";

function logError(message: string) : string {
    console.error(message);
    return message;
}

export class DataSingleton {
    users: Record<string, User> = {}
    nameToUid: Record<string, string> = {}
    inventories: Record<string, Record<string, InventoryItem>> = {}

    private loaded: boolean = false
    private static data: DataSingleton = new DataSingleton();


    // --- Load functions ---
    async loadUserInventory(user: User) {
        try {
            this.inventories[user.uid] = await fs.readFile(`./data/inventories/${user.uid}.json`, "utf-8").then((data) => { return JSON.parse(data) });

            // TODO : sanatize inventories ?
        } catch (e) {
            console.warn(`Could not load inventory for user ${user.username} (uid: ${user.uid})`);
            this.inventories[user.uid] = {};

            this.saveUserInventory(user.uid, {});
        }
    }

    static async load() {
        await fs.mkdir("./data/inventories/", {
            recursive: true
        });
        
        try {
            this.data.users = await fs.readFile("./data/users.json", "utf-8").then((data) => { return JSON.parse(data) });
        } catch (e) {
            console.warn("Could not load users data !");
            this.data.users = {};

            await this.data.saveUsers();
        }

        for (let [uid, user] of Object.entries(this.data.users)) {
            this.data.loadUserInventory(user);
            this.data.nameToUid[user.username] = uid;
        }

        this.data.loaded = true;
    };

    static getInstance() : DataSingleton {
        if (!this.data.loaded) {
            throw new Error("Data is not loaded !");
        }

        return this.data;
    }

    // --- Save functions ---
    private async saveUserInventory(userUid: string, inventory?: Record<string, InventoryItem>) {
        // TODO : We probably should await previous calls to this function. Should no longer be a problem when using proper databases
        await fs.writeFile(`./data/inventories/${userUid}.json`, JSON.stringify(inventory ?? this.inventories[userUid] ?? {}), "utf-8");
    }

    private async saveUsers() {
        // TODO : We probably should await previous calls to this function. Should no longer be a problem when using proper databases
        await fs.writeFile("./data/users.json", JSON.stringify(this.users), "utf-8");
    };

    // --- Endpoints ---
    createUser(username: string, type: UserType) : User {
        let uid = uuidv4();
        while (uid in this.users) {
            uid = uuidv4();
        }

        let newUser: User = {
            uid,
            username,
            type,
        };

        this.users[uid] = newUser;
        this.saveUsers();

        return newUser;
    }

    getUserByName(username: string) : User | null {
        for (let [_, user] of Object.entries(this.users)) {
            if (user.username === username) {
                return user;
            }
        }

        return null;
    }

    getUser(uid: string) : User | null {
        if (this.users[uid] !== undefined) {
            return this.users[uid];
        }

        return null;
    }

    getUserInventory(uid: string) : Record<string, InventoryItem> {
        if (this.inventories[uid] !== undefined) {
            return this.inventories[uid];
        }

        return {};
    }

    addItemToInventory(userUid: string, type: ItemType, id: string) : string | undefined {
        const staticData = StaticDataSingleton.getInstance();

        if (type == "booster") {
            if (!(id in staticData.staticData.sets)) {
                return logError(`Unknown set of id ${id}`);
            }
        } else if (type == "card") {
            if (!(id in staticData.staticData.cards)) {
                return logError(`Unknown card of id ${id}`);
            }
        } else {
            return logError(`Unkown type of item : ${type}`);
        }

        const inventory = this.inventories[userUid];

        if (inventory === undefined) {
            return logError(`No inventory for user ${userUid}`);
        }

        let itemUid = uuidv4();

        while (itemUid in inventory) {
            itemUid = uuidv4();
        }

        inventory[itemUid] = {
            type,
            id,
            uid: itemUid
        }

        this.saveUserInventory(userUid, inventory);
    }

    removeItemFromInventory(userUid: string, uid: string) : string | undefined {
        const inventory = this.inventories[userUid];

        if (inventory === undefined) {
            return logError(`No inventory for user ${userUid}`);
        }

        if (!(uid in inventory)) {
            return logError(`No item of uid ${uid} in the inventory of user ${userUid}`);
        }

        delete inventory[uid];

        this.saveUserInventory(userUid, inventory);
    }

    removeItemFromInventoryById(userUid: string, type: ItemType, id: string, n: number = -1) : string | undefined {
        if (n == 0) {
            return;
        }

        const inventory = this.inventories[userUid];

        if (inventory === undefined) {
            return logError(`No inventory for user ${userUid}`);
        }

        let uidsToDelete = []

        for (let [currUid, item] of Object.entries(inventory)) {
            if (id == item.id && type == item.type) {
                uidsToDelete.push(currUid);

                if (n > 0 && uidsToDelete.length >= n) {
                    break;
                }
            }
        }

        for (let uid of uidsToDelete) {
            delete inventory[uid];
        }

        this.saveUserInventory(userUid, inventory);
    }
};
