import fs from "fs/promises"
import { v4 as uuidv4 } from "uuid"

import type { FullUser, InventoryItem, InventoryItemT, ItemType, User, UserType } from "./interfaces"
import { StaticDataSingleton } from "../staticData/loader";
import { Expected, expected, unexpected } from "../../common/utils";

export class DataSingleton {
    users: Record<string, FullUser> = {}
    nameToUid: Record<string, string> = {}

    private loaded: boolean = false
    private static data: DataSingleton = new DataSingleton();


    // --- Load functions ---
    async loadUserInventory(user: FullUser) {
        try {
            user.inventory = await fs.readFile(`./data/inventories/${user.uid}.json`, "utf-8").then((data) => { return JSON.parse(data) });

            // TODO : sanatize inventories ?
        } catch (e) {
            console.warn(`Could not load inventory for user ${user.username} (uid: ${user.uid})`);
            user.inventory = {};

            this.saveUserInventory(user);
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
    private async saveUserInventory(user: FullUser) {
        // TODO : We probably should await previous calls to this function. Should no longer be a problem when using proper databases
        await fs.writeFile(`./data/inventories/${user.uid}.json`, JSON.stringify(user.inventory ?? {}), "utf-8");
    }

    private async saveUsers() {
        function replacer(key: string, value: FullUser | Record<string, FullUser>) {
            if (key === "" || (typeof value) === "string") {
                return value;
            }
            return DataSingleton.trimFullUser(value as FullUser);
        }

        // TODO : We probably should await previous calls to this function. Should no longer be a problem when using proper databases
        await fs.writeFile("./data/users.json", JSON.stringify(this.users, replacer), "utf-8");
    };

    // --- Endpoints ---
    createUser(username: string, type: UserType) : FullUser {
        let uid = uuidv4();
        while (uid in this.users) {
            uid = uuidv4();
        }

        let newUser: FullUser = {
            uid,
            username,
            type,
            inventory: {}
        };

        this.users[uid] = newUser;
        
        this.saveUsers();
        this.saveUserInventory(newUser);

        return newUser;
    }

    static trimFullUser(fullUser: FullUser) : User {
        return  {
            uid: fullUser.uid,
            username: fullUser.username,

            type: fullUser.type,
        };
    }

    getUserByName(username: string) : FullUser | null {
        for (let [_, user] of Object.entries(this.users)) {
            if (user.username === username) {
                return user;
            }
        }

        return null;
    }

    getUser(uid: string) : FullUser | null {
        if (this.users[uid] !== undefined) {
            return this.users[uid];
        }

        return null;
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

        const user = this.users[userUid];

        if (user === undefined) {
            return unexpected(`No inventory for user ${userUid}`, true);
        }

        let itemUid = uuidv4();

        while (itemUid in user.inventory) {
            itemUid = uuidv4();
        }

        let item: InventoryItem = {
            type,
            id,
            uid: itemUid
        }

        user.inventory[itemUid] = item;

        this.saveUserInventory(user);

        return expected(item as InventoryItemT<T>);
    }

    removeItemFromInventory(userUid: string, uid: string) : Expected<InventoryItem> {
        const user = this.users[userUid];
        if (user === undefined) {
            return unexpected(`No inventory for user ${userUid}`, true);
        }

        const inventory = user.inventory;

        if (inventory[uid] === undefined) {
            return unexpected(`No item of uid ${uid} in the inventory of user ${userUid}`, true);
        }

        let item = structuredClone(inventory[uid]);
        delete inventory[uid];

        this.saveUserInventory(user);

        return expected(item);
    }

    removeItemFromInventoryById(userUid: string, type: ItemType, id: string, n: number = -1) : Expected<Array<InventoryItem>> {
        if (n == 0) {
            return expected([]);
        }

        const user = this.users[userUid];
        if (user === undefined) {
            return unexpected(`No inventory for user ${userUid}`, true);
        }

        const inventory = user.inventory;
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

        this.saveUserInventory(user);

        return expected(deleted);
    }
};
