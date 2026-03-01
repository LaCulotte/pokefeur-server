import type { InventoryItem } from "../model/interfaces";
import { Expected, expected, unexpected } from "../../common/utils";
import { UserModel } from "../model/UserModel";
import type { Type } from "../../common/constants";

// This returns the needed items based 
export abstract class BaseItemsController {
    abstract getItem(itemUid: string): Expected<InventoryItem>;
    abstract getEnergyCount(energyType: Type): Expected<number>;
}

export class UserItemsController extends BaseItemsController {
    user: UserModel;

    constructor(user: UserModel) {
        super();

        this.user = user;
    }

    override getItem(itemUid: string): Expected<InventoryItem> {
        const item = this.user.inventory.data.items[itemUid];
        if (item === undefined) {
            return unexpected(`User ${this.user.data.username} does not have any item of uid ${itemUid}`);
        }

        return expected(item);
    }

    override getEnergyCount(energyType: Type): Expected<number> {
        const count = this.user.inventory.data.energies[energyType];
        if (count === undefined) {
            return unexpected(`User ${this.user.data.username} does not have any energy of type ${energyType}`);
        }

        return expected(count);
    }
}