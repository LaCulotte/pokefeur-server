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
        this.inventory.loadUserInventory();
        this.deals.loadDeals();
    }

    async saveUserData() {
        this.inventory.saveInventory();
        this.deals.saveDeals();
    }
}