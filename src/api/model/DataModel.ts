import fs from "fs/promises"
import { v4 as uuidv4 } from "uuid"

import type { User, UserType } from "./interfaces"
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
            let users: Record<string, User> = await fs.readFile("./data/users.json", "utf-8")
                                                .then((jdata) => { return JSON.parse(jdata) });

            for (let [uid, user] of Object.entries(users)) {
                this.instance.users[uid] = new UserModel(user);
            }
        } catch (e) {
            console.warn(`Could not load users data ! Error : ${e}`);
            
            await this.instance.saveUsers();
        }
        
        for (let [uid, user] of Object.entries(this.instance.users)) {
            await user.loadUserData();
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

        // TODO : init controllers

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
