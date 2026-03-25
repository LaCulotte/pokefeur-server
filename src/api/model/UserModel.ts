import type { User } from "./interfaces"
import { InventoryModel } from "./InventoryModel";
import { DealsModel } from "./DealsModel";
import { UserTradesModel } from "./UserTradesModel";

export class UserModel {
    data: User
    inventory: InventoryModel
    deals: DealsModel
    trades: UserTradesModel

    constructor(user: User) {
        this.data = user;
        this.inventory = new InventoryModel(user);
        this.deals = new DealsModel(user);
        this.trades = new UserTradesModel(user);
    }

    static async createDirs() {
        await InventoryModel.createDirs();
        await DealsModel.createDirs();
        await UserTradesModel.createDirs();
    }

    async loadUserData() {
        await this.inventory.loadUserInventory();
        await this.deals.loadDeals();
        await this.trades.loadTrades();
    }

    async saveUserData() {
        await this.inventory.saveInventory();
        await this.deals.saveDeals();
        await this.trades.saveTrades();
    }
}