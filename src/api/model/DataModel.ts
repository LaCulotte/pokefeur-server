import fs from "fs/promises"
import { v4 as uuidv4 } from "uuid"

import type { User, UserSearchResult, UserType } from "./interfaces"
import { UserModel } from "./UserModel";
import { TradeProposalsModel } from "./TradeProposalsModel";

export class DataModel {
    users: Record<string, UserModel> = {};
    nameToUser: Record<string, UserModel> = {};

    tradeProposals: TradeProposalsModel = new TradeProposalsModel();

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
            const users: Record<string, User> = await fs.readFile("./data/users.json", "utf-8").then((data) => { return JSON.parse(data) });

            for (const [uid, user] of Object.entries(users)) {
                this.instance.users[uid] = new UserModel(user);
            }
        } catch (e) {
            console.warn(`Could not load users data ! Error : ${e}`);
            
            await this.instance.saveUsers();
        }
        
        for (const [uid, user] of Object.entries(this.instance.users)) {
            await user.loadUserData();
            this.instance.nameToUser[user.data.username] = user;
        }

        await this.instance.tradeProposals.loadProposals();
        this.instance.loaded = true;
        
        this.instance.tradeProposals.attachToUsers();   // TODO : outside of load ?
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

        const newUser: User = {
            uid,
            username,
            type,
        };

        const newUserModel = new UserModel(newUser); 

        this.users[uid] = newUserModel
        this.nameToUser[username] = newUserModel;
        
        this.saveUsers();
        newUserModel.saveUserData();

        // TODO : init controllers

        return newUserModel;
    }

    getUserByName(query: string) : UserModel | undefined {
        return Object.entries(this.nameToUser)
            .find(([username, _]) => { return username == query; })
            ?.[1];
    }

    static getUserByName(username: string) : UserModel | undefined {
        return DataModel.getInstance().getUserByName(username);
    }

    getUser(uid: string) : UserModel | undefined {
        return this.users[uid];
    }

    static getUser(uid: string) : UserModel | undefined {
        return DataModel.getInstance().getUser(uid);
    }

    changeDescription(uid: string, newDescription: string) : boolean {
        if (newDescription.length > 500) {
            // TODO: use expected ??
            return false;
        }
        
        const user = DataModel.getUser(uid);
        if (!user) {
            return false;
        }
        
        user.data.description = newDescription;
        this.saveUsers();
        return true;
    }

    searchUsers(usernameQuery: string): UserSearchResult[] {
        const safeQuery = usernameQuery.toLocaleLowerCase()
        return Object.entries(this.nameToUser)
            .filter(([username, _]) => username.toLowerCase().includes(safeQuery))
            .map(([username, user]) => {
                return {
                    username,
                    uid: user.data.uid,
                    description: user.data.description
                }; 
            });
    }
};
