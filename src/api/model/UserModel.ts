import type { User } from "./interfaces"
import { InventoryModel } from "./InventoryModel";
import { DealsModel } from "./DealsModel";

export class UserModel {
    data: User
    inventory: InventoryModel
    deals: DealsModel

    constructor(user: User) {
        this.data = user;
        this.inventory = new InventoryModel(user);
        this.deals = new DealsModel(user);
    }

    static async createDirs() {
        await InventoryModel.createDirs();
        await DealsModel.createDirs();
    }

    async loadUserData() {
        await this.inventory.loadUserInventory();
        await this.deals.loadDeals();
    }

    async saveUserData() {
        await this.inventory.saveInventory();
        await this.deals.saveDeals();
    }
}