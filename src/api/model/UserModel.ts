import type { User } from "./interfaces"
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