import fs from "fs/promises"
import { v4 as uuidv4 } from "uuid"

import type { FullUser, InventoryItem, InventoryItemT, ItemType, User, UserType } from "./interfaces"
import { StaticDataSingleton } from "../staticData/loader";
import { Expected, expected, unexpected } from "../../common/utils";
import { InventoryModel } from "./InventoryModel";

export class UserModel {
    data: User
    inventory: InventoryModel

    constructor(user: User) {
        this.data = user;
        this.inventory = new InventoryModel(user);
    }

    static async createDirs() {
        await InventoryModel.createDirs();
    }

    async loadUserData() {
        this.inventory.loadUserInventory();
    }

    async saveUserData() {
        this.inventory.saveInventory();
    }
}