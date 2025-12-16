import fs from "fs/promises"
import { v4 as uuidv4 } from "uuid"

import type { InventoryItem, InventoryItemT, ItemType, User, UserType } from "./interfaces"
import { StaticDataSingleton } from "../staticData/loader";
import { Expected, expected, unexpected } from "../../common/utils";

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
        this.inventories[uid] = {};
        
        this.saveUsers();
        this.saveUserInventory(uid, {});

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

    addItemToInventory<T extends ItemType>(userUid: string, type: T, id: string) : Expected<InventoryItemT<T>> {
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

        const inventory = this.inventories[userUid];

        if (inventory === undefined) {
            return unexpected(`No inventory for user ${userUid}`, true);
        }

        let itemUid = uuidv4();

        while (itemUid in inventory) {
            itemUid = uuidv4();
        }

        let item: InventoryItem = {
            type,
            id,
            uid: itemUid
        }

        inventory[itemUid] = item;

        this.saveUserInventory(userUid, inventory);

        return expected(item as InventoryItemT<T>);
    }

    removeItemFromInventory(userUid: string, uid: string) : Expected<InventoryItem> {
        const inventory = this.inventories[userUid];

        if (inventory === undefined) {
            return unexpected(`No inventory for user ${userUid}`, true);
        }

        if (inventory[uid] === undefined) {
            return unexpected(`No item of uid ${uid} in the inventory of user ${userUid}`, true);
        }

        let item = structuredClone(inventory[uid]);
        delete inventory[uid];

        this.saveUserInventory(userUid, inventory);

        return expected(item);
    }

    removeItemFromInventoryById(userUid: string, type: ItemType, id: string, n: number = -1) : Expected<Array<InventoryItem>> {
        if (n == 0) {
            return expected([]);
        }

        const inventory = this.inventories[userUid];

        if (inventory === undefined) {
            return unexpected(`No inventory for user ${userUid}`, true);
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

        let deleted: Array<InventoryItem> = [];
        for (let uid of uidsToDelete) {
            deleted.push(structuredClone(inventory[uid]) as InventoryItem);
            delete inventory[uid];
        }

        this.saveUserInventory(userUid, inventory);

        return expected(deleted);
    }
};
