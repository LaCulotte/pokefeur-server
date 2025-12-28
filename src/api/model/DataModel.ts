import fs from "fs/promises"
import { v4 as uuidv4 } from "uuid"

import type { FullUser, InventoryItem, InventoryItemT, ItemType, User, UserType } from "./interfaces"
import { StaticDataSingleton } from "../staticData/loader";
import { Expected, expected, unexpected } from "../../common/utils";
import { InventoryModel } from "./InventoryModel";
import { UserModel } from "./UserModel";

export class DataModel {
    users: Record<string, UserModel> = {};
    nameToUid: Record<string, string> = {};

    private loaded: boolean = false;
    // Do not access anywhere other than UserController !
    private static instance: DataModel = new DataModel();

    static getInstance() : DataModel {
        if (!this.instance.loaded) {
            throw new Error("Data is not loaded !");
        }

        return this.instance;
    }

    static async createDirs() {
        await fs.mkdir("./data/", {
            recursive: true
        });

        await UserModel.createDirs();
    }

    // --- Load functions ---
    static async load() {
        await this.createDirs();

        try {
            let users: Record<string, FullUser> = {}
            users = await fs.readFile("./data/users.json", "utf-8").then((jdata) => { return JSON.parse(jdata) });

            for (let [uid, user] of Object.entries(users)) {
                this.instance.users[uid] = new UserModel(user);
            }
        } catch (e) {
            console.warn("Could not load users data !");

            await this.instance.saveUsers();
        }
        
        for (let [uid, user] of Object.entries(this.instance.users)) {
            user.loadUserData();
            this.instance.nameToUid[user.data.username] = uid;
        }

        this.instance.loaded = true;
    };

    // --- Save functions ---

    async saveUsers() {
        function replacer(key: string, value: UserModel | any) {
            if (value instanceof UserModel) {
                return value.data;
            }
            return value;
        }

        // TODO : We probably should await previous calls to this function. Should no longer be a problem when using proper databases
        await fs.writeFile("./data/users.json", JSON.stringify(this.users, replacer), "utf-8");
    };

    // --- Endpoints ---
    createUser(username: string, type: UserType) : UserModel {
        let uid = uuidv4();
        while (uid in this.users) {
            uid = uuidv4();
        }

        let newUser: User = {
            uid,
            username,
            type,
        };

        let newUserModel = new UserModel(newUser); 

        this.users[uid] = newUserModel
        
        this.saveUsers();
        newUserModel.saveUserData();

        return newUserModel;
    }

    getUserByName(username: string) : UserModel | null {
        // TODO : use nameToUid instead !!
        for (let [_, user] of Object.entries(this.users)) {
            if (user.data.username === username) {
                return user;
            }
        }

        return null;
    }

    static getUserByName(username: string) : UserModel | null {
        return DataModel.getInstance().getUserByName(username);
    }

    getUser(uid: string) : UserModel | null {
        if (this.users[uid] !== undefined) {
            return this.users[uid];
        }

        return null;
    }

    static getUser(uid: string) : UserModel | null {
        return DataModel.getInstance().getUser(uid);
    }
};
