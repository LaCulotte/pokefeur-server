import type { Payment, InventoryItem, DealCostEnergy, DealCostCard, DealCostCardOfType, ItemPayment, DealCostCardOfSet } from "../model/interfaces";
import type { DealCostUnit, DealCostBooster } from "../model/interfaces";
import { Expected, expected, unexpected } from "../../common/utils";
import { UserModel } from "../model/UserModel";
import type { Type } from "../../common/constants";
import { StaticDataSingleton } from "../staticData/loader";
import type { BaseItemsController } from "./item";
import { isCardOfSet, isCardOfType } from "../../common/checks";

// export abstract class BaseCostController {
//     abstract checkPayment(items: BaseItemsController, payment: UnitPayment, paid: Payment): Expected<UnitPayment>;
// }

export class EnergyCostController {
    // data: DealCostEnergy;
    energyType: Type;
    count: number;

    constructor(energyType: Type, count: number) {
        this.energyType = energyType;
        this.count = count;
    }

    // override getData() {
    //     return this.data;
    // }

    filterEnergyType(type: Type): boolean {
        return this.energyType == type;
    }

    checkPayment(items: BaseItemsController, energyPayment: number, paid: Payment["energies"]): Expected<number> {
        if (energyPayment < this.count) {
            return unexpected(`Expected payment of at least ${this.count} energies, got ${energyPayment}`);
        }

        const userCount = items.getEnergyCount(this.energyType);
        if (userCount.value_or(-1) < energyPayment) {
            return unexpected(`This user does not have enough energies of type ${this.energyType}; Expected at least ${energyPayment}, got ${userCount.value_nice() ?? 'none'}`);
        }

        return expected(this.count);
    }
}

export abstract class ItemCostController {
    abstract getData(): DealCostUnit;

    abstract filterItem(item: InventoryItem): boolean;

    checkPayment(items: BaseItemsController, payment: ItemPayment, paid: Payment["items"]): Expected<ItemPayment> {
        if (paid.find((unit) => { return unit.itemUid == payment.itemUid; }) !== undefined) {
            return unexpected(`Cannot pay multiple times with the same item of uid ${payment.itemUid}`);
        }

        let itemExp = items.getItem(payment.itemUid);
        if (!itemExp.has_value()) {
            return unexpected(`Cannot get payment item of uid ${payment.itemUid} : ${itemExp.error()}`);
        }

        if (!this.filterItem(itemExp.value())) {
            return unexpected(`Item ${JSON.stringify(itemExp.value())} is not compatible with payment requirements`);
        }

        return expected(payment);
    }
}

class BoosterCostController extends ItemCostController {
    // static type: string = "booster";    // Two sources of truth ??

    data: DealCostBooster;

    constructor(costUnit: DealCostBooster) {
        super();

        this.data = costUnit;
    }

    override getData(): DealCostUnit {
        return this.data;
    }

    override filterItem(item: InventoryItem): boolean {
        return item.type == "booster" && this.data.id == item.id;
    }

    // static generate(sets: Array<string>, user?: UserModel): DealCostBooster {
    //     if (sets.length == 0) {
    //         throw new Error("'sets' is empty ??");
    //     }
    //
    //     const costSetId = sets[Math.floor(Math.random() * sets.length)]!;
    //     return { type: "booster", id: costSetId };
    // }
}

class CardCostController extends ItemCostController {
    // static type: string = "card";    // Two sources of truth ??

    data: DealCostCard;

    constructor(costUnit: DealCostCard) {
        super();

        this.data = costUnit;
    }

    override getData(): DealCostUnit {
        return this.data;
    }

    override filterItem(item: InventoryItem): boolean {
        return item.type == "card" && this.data.id == item.id;
    }

    // static generate(sets: Array<string>, user?: UserModel): DealCostCard {
    //     if (sets.length == 0) {
    //         throw new Error("'sets' is empty ??");
    //     }
        
    //     const costSetId = sets[Math.floor(Math.random() * sets.length)]!;

    //     const staticDataInstance = StaticDataSingleton.getInstance();
    //     const set = staticDataInstance.staticData.sets[costSetId];
    //     if (set === undefined) {
    //         throw new Error(`Cannot get set '${costSetId}' !`)
    //     }
    //     const cardsIds = Object.keys(set.cards);
    //     if (cardsIds.length == 0) {
    //         throw new Error(`No card in set '${costSetId}'! (cards : ${set.cards})`)
    //     }
    //     const costCardId = cardsIds[Math.floor(Math.random() * cardsIds.length)]!;
    //     return { type: "card", id: costSetId };
    // }
}

class CardOfTypeCostController extends ItemCostController {
    // static type: string = "card";    // Two sources of truth ??

    data: DealCostCardOfType;

    constructor(costUnit: DealCostCardOfType) {
        super();

        this.data = costUnit;
    }

    override getData(): DealCostUnit {
        return this.data;
    }

    override filterItem(item: InventoryItem): boolean {
        const staticData = StaticDataSingleton.getInstance().staticData;
        return isCardOfType(staticData, item.id, this.data.id);
    }
}

class CardOfSetCostController extends ItemCostController {
    // static type: string = "card";    // Two sources of truth ??

    data: DealCostCardOfSet;

    constructor(costUnit: DealCostCardOfSet) {
        super();

        this.data = costUnit;
    }

    override getData(): DealCostUnit {
        return this.data;
    }

    override filterItem(item: InventoryItem): boolean {
        const staticData = StaticDataSingleton.getInstance().staticData;
        return isCardOfSet(staticData, item.id, this.data.id);
    }
}


type Constructor<T> = new (...args: any[]) => T;
const CONTROLLER_MAP: Record<string, Constructor<ItemCostController>> = { // Warning, multiple sources of thruth ??
    "booster": BoosterCostController,
    // "energy": EnergyCostController,
    "card": CardCostController,
    "card-of-type": CardOfTypeCostController,
    "card-of-set": CardOfSetCostController,
}

export function costControllerFactory(costUnit: DealCostUnit) : ItemCostController {
    const controllerType = CONTROLLER_MAP[costUnit.type];
    if (controllerType === undefined) {
        throw new Error("What the hell ?");
    }

    return new controllerType(costUnit);
}
