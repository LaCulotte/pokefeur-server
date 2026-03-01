import { DataModel } from "../model/DataModel";
import { StaticDataSingleton } from "../staticData/loader";

import { expected, unexpected, type Expected } from "../../common/utils";
import type {
    Deal,
    FullDeal,
    ItemType,
    Payment } from "../model/interfaces";
import type { AcceptDealSummary, RedeemDealSummary } from "./interfaces.dealership"
import { Type, parseType, SUPPORTED_ENERGY_TYPES } from "../../common/constants";
import type { UserModel } from "../model/UserModel";
import { DealsModel } from "../model/DealsModel";
import type { DealSchema, DealershipSchema } from "../../../resources/dealership/dealership-data.interfaces"
import { ItemCostController, EnergyCostController, costControllerFactory } from "./cost";
import { UserItemsController, type BaseItemsController,  } from "./item";


const DEAL_SCHEMAS: DealershipSchema = {
    "card": {
        "timeout": 30,
        "waittime": 10,
        "cost": {
            "cards": {
                "count": 0,
                "sets": [
                    "me01",
                    "me02",
                    "me02.5"
                ]
            },
            "boosters": {
                "count": 1,
                "sets": [
                    "me01",
                    "me02",
                    "me02.5"
                ]
            },
            "energies": {
                "count": 0,
                "types": SUPPORTED_ENERGY_TYPES
            },
            "cards-of-type": {
                "count": 1,
                "types": [
                    Type.COLORLESS,
                    Type.GRASS,
                    Type.FIRE,
                    Type.WATER,
                    Type.LIGHTNING,
                    Type.PSYCHIC,
                    Type.FIGHTING,
                    Type.DARKNESS,
                    Type.METAL,
                    Type.FAIRY,
                    Type.DRAGON
                ]
            },
            "cards-of-set": {
                "count": 1,
                "sets": [
                    "me01",
                    "me02",
                    "me02.5"
                ]
            }
        },
        "rewards": {
            "cards": [],
            "boosters": [
                "me01",
                "me02",
                "me02.5"
            ]
        },
    },
    "energies": {
        "timeout": 30,
        "waittime": 10,
        "cost": {
            "energies": {
                "count": 3,
                "types": SUPPORTED_ENERGY_TYPES
            }
        },
        "rewards": {
            "cards": [],
            "boosters": [
                "me01",
                "me02",
                "me02.5"
            ]
        },
    },
}


class DealController {
    deals: DealsModel;
    schema: DealSchema | undefined;
    
    type: string;
    dealUid: string | undefined;

    updateTimeout: NodeJS.Timeout | undefined;

    cost: {
        energies: Partial<Record<Type, EnergyCostController>>,
        items: Array<ItemCostController>

    }

    constructor(deals: DealsModel, type: string) {
        this.deals = deals;
        this.type = type;

        this.schema = DEAL_SCHEMAS[this.type];

        this.dealUid = undefined;
        this.updateTimeout = undefined;

        this.cost = {
            energies: {},
            items: []
        };
    }

    attach(deal: FullDeal): boolean {
        if (this.dealUid !== undefined) {
            return false;
        }

        if(deal.type != this.type) {
            return false;
        }

        this.dealUid = deal.uid;
        
        this.attachCost(deal.cost);

        return true;
    }

    attachCost(cost: Deal["cost"]) {
        this.cost = {
            energies: {},
            items: []
        };

        for (let [typeStr, count] of Object.entries(cost.energies)) {
            let type = parseType(typeStr);

            if (type === undefined) {
                console.error(`Undefined type '${typeStr}' in deal cost ??? (Cost: ${cost})`);
                continue;
            }

             this.cost.energies[type] = new EnergyCostController(type, count);
        }
        
        for (let unit of cost.items) {
            this.cost.items.push(costControllerFactory(unit));
        }

    }

    // TODO : detach 
    //      => this will be called before the DealController's destruction and delete the associated deal if not in the 'proposed' state

    generateCost(): Deal["cost"] {
        let cost: Deal["cost"] = {
            energies: {},
            items: []
        };

        if (this.schema === undefined) {
            return cost;
        }

        const staticDataInstance = StaticDataSingleton.getInstance();

       
        // randomizeEnergies
        for (let i = 0; this.schema.cost.energies !== undefined && i < this.schema.cost.energies.count; i++) {
            const types: Array<Type> = this.schema.cost.energies.types;
            if (types.length === 0) {
                throw new Error(`Error on generateCost for dealType ${this.type} : 'cost.energies.count != 0' while 'cost.energies.types.length == 0' !`)
            }

            const costType = types[Math.floor(Math.random() * types.length)]!;

            if (cost.energies[costType] === undefined) {
                cost.energies[costType] = 0;
            }

            cost.energies[costType] ++;
        }

        // randomizeEnergies
        for (let i = 0; this.schema.cost["cards-of-type"] !== undefined && i < this.schema.cost["cards-of-type"].count; i++) {
            const types: Array<Type> = this.schema.cost["cards-of-type"].types;
            if (types.length === 0) {
                throw new Error(`Error on generateCost for dealType ${this.type} : 'cost.cards-of-type.count != 0' while 'cost.cards-of-type.types.length == 0' !`)
            }

            const costType = types[Math.floor(Math.random() * types.length)]!;
            cost.items.push({type: "card-of-type", id: costType});
        }

        // randomizeCards
        for (let i = 0; this.schema.cost.cards !== undefined && i < this.schema.cost.cards.count; i++) {
            const sets = this.schema.cost.cards.sets;
            if (sets.length === 0) {
                throw new Error(`Error on generateCost for dealType ${this.type} : 'cost.cards.count != 0' while 'cost.cards.sets.length == 0' !`)
            }

            const costSetId = sets[Math.floor(Math.random() * sets.length)]!;

            const set = staticDataInstance.staticData.sets[costSetId];
            if (set === undefined) {
                throw new Error(`Error on generateCost for dealType ${this.type} : cannot get set '${costSetId}' !`)
            }

            const cardsIds = Object.keys(set.cards);
            if (cardsIds.length == 0) {
                throw new Error(`Error on generateCost for dealType ${this.type} : no card in set '${costSetId}'! (cards : ${set.cards})`)
            }

            const costCardId = cardsIds[Math.floor(Math.random() * cardsIds.length)]!;
            cost.items.push({type: "card", id: costCardId});
        }

        // randomizeSets
        for (let i = 0; this.schema.cost.boosters !== undefined && i < this.schema.cost.boosters.count; i++) {
            const sets = this.schema.cost.boosters.sets;
            if (sets.length === 0) {
                throw new Error(`Error on generateCost for dealType ${this.type} : 'cost.boosters.count != 0' while 'cost.boosters.sets.length == 0' !`)
            }

            const costSetId = sets[Math.floor(Math.random() * sets.length)]!;

            cost.items.push({type: "booster", id: costSetId});
        }

        for (let i = 0; this.schema.cost["cards-of-set"] !== undefined && i < this.schema.cost["cards-of-set"].count; i++) {
            const sets = this.schema.cost["cards-of-set"].sets;
            if (sets.length === 0) {
                throw new Error(`Error on generateCost for dealType ${this.type} : 'cost.cards-of-set.count != 0' while 'cost.cards-of-set.sets.length == 0' !`)
            }

            const costSetId = sets[Math.floor(Math.random() * sets.length)]!;

            cost.items.push({type: "card-of-set", id: costSetId});
        }
        
        return cost;
    }

    generateReward(): Expected<{type: ItemType, id: string}> {
        if (this.schema === undefined) {
            return unexpected(`No schema for deal of type ${this.type}!`);
        }

        const rewardSchema = this.schema.rewards;
        const reward: {type: ItemType, id: string} = {
            type: "booster",
            id: ""
        }

        const rewardSeed = Math.floor(Math.random() * (rewardSchema.boosters.length + rewardSchema.cards.length));
        if (rewardSeed < rewardSchema.boosters.length) {
            reward.type = "booster";
            reward.id = rewardSchema.boosters[rewardSeed]!;
        } else {
            reward.type = "card";
            reward.id = rewardSchema.cards[rewardSeed - rewardSchema.boosters.length]!;
        }

        return expected(reward);
    }

    getDeal(): Expected<FullDeal> {
        if (this.dealUid === undefined) {
            return unexpected("No deal defined !");
        }

        let deal = this.deals.data[this.dealUid];
        if (deal === undefined) {
            return unexpected(`No deal of id ${this.dealUid}`);
        }

        return expected(deal);
    }

    async generateDeal() {
        if (this.schema === undefined) {
            throw new Error(`Cannot generate new deal : No associated schema !!`);
        }

        const timeout = this.schema.timeout;
        const waitTime = this.schema.waittime;

        const expReward = this.generateReward();
        if (!expReward.has_value()) {
            throw new Error(`Cannot generate reward ! Reason : ${expReward.error()}`);
        }
        const expDeal = await this.deals.addDeal(this.type, this.generateCost(), expReward.value().type, expReward.value().id, timeout, waitTime);

        if (!expDeal.has_value()) {
            // TODO : do not generate an error ?
            throw new Error(`Cannot generate new deal ?? Reason : ${expDeal.error()}`);
        }

        this.dealUid = expDeal.value().uid;
        this.attachCost(expDeal.value().cost);

        if (this.updateTimeout !== undefined) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(() => { this.handleExpired(); }, expDeal.value().timeoutDuration * 1000);
    }

    async init() {
        let dealExp = this.getDeal();
        if (!dealExp.has_value()) {
            await this.generateDeal();
            return;
        }

        let deal = dealExp.value();
        let now = Math.floor(Date.now() / 1000);
        if (deal.state !== "accepted" && deal.proposedDate + deal.timeoutDuration < now) {
            console.log("Deal expired. Regenerating it")
            delete this.deals.data[this.dealUid ?? ""];
            
            await this.generateDeal();
        } else if (deal.proposedDate + deal.timeoutDuration > now) {
            const delay = (deal.proposedDate + deal.timeoutDuration - now) * 1000;
            this.updateTimeout = setTimeout(() => { this.handleExpired(); }, delay);
        }
    }
    
    async handleExpired() {
        let dealExp = this.getDeal();
        if (!dealExp.has_value()) {
            await this.generateDeal();
            return;
        }

        let deal = dealExp.value();
        if (deal.state !== "accepted") {
            // proposed or redeemed
            delete this.deals.data[this.dealUid ?? ""];

            await this.generateDeal();
            return;
        }

        this.updateTimeout = undefined;
    }

    async handleRedeemed() {
        let dealExp = this.getDeal();
        if (!dealExp.has_value()) {
            await this.generateDeal();
            // save
            return;
        }

        let deal = dealExp.value();
        let now = Math.floor(Date.now() / 1000);

        if (this.updateTimeout === undefined) {
            delete this.deals.data[this.dealUid ?? ""];

            await this.generateDeal();
            // save
            return;
        }

        if (deal.state !== "redeemed") {
            console.warn(`handleRedeemed called on a deal that is not in the 'redeemed' state ! This can cause a deal to be stuck and unobtainable !\
    Deal :  ${JSON.stringify(deal)}`);
        }
    }

    checkItemCost(items: BaseItemsController, paymentItems: Payment["items"]): Expected<Payment["items"]> {
        let paid: Payment["items"] = [];

        let costItems = this.cost.items;

        if (paymentItems.length != costItems.length) {
            return unexpected(`Number of payment items is invalid. Expected ${costItems.length}, got ${paymentItems.length}`);
        }

        let seenIndexes = new Set<number>();
        for (let unit of paymentItems) {
            if (seenIndexes.has(unit.costIndex)) {
                return unexpected(`Mutiple unitPayment for the same cost ! Cost index: ${unit.costIndex}`);
            }

            if (unit.costIndex < 0 || unit.costIndex > costItems.length) {
                return unexpected(`Cost index ${unit.costIndex} is not in range ! Expected between 0 and ${costItems.length - 1}.`)
            }

            let cost = costItems[unit.costIndex]!;
            let res = cost.checkPayment(items, unit, paid);

            if (!res.has_value()) {
                return unexpected(`Payment invalid for deal cost unit ${JSON.stringify(cost.getData())} : ${res.error()}; Payment: ${JSON.stringify(paymentItems)}`);
            }

            paid.push(res.value());
            seenIndexes.add(unit.costIndex);
        }

        return expected(paid);
    }

    checkEnergyCost(items: BaseItemsController, paymentEnergies: Payment["energies"]): Expected<Payment["energies"]> {
        let paid: Payment["energies"] = {};
        let cost = this.cost.energies;

        for (let [type, costController] of Object.entries(cost)) {
            let parsedType = parseType(type);
            if (parsedType === undefined || paymentEnergies[parsedType] === undefined) {
                return unexpected(`Payment does include any energy of type ${type}, needs ${costController.count})`);
            }

            let ret = costController.checkPayment(items, paymentEnergies[parsedType], paid);
            if (!ret.has_value()) {
                return ret.as_error();
            }

            paid[parsedType] = ret.value();
        }
        return expected(paid);
    }

    checkCost(items: BaseItemsController, payment: Payment): Expected<Payment> {
        // Items
        let expItems = this.checkItemCost(items, payment["items"]);
        if (!expItems.has_value()) {
            return expItems.as_error();
        }

        let expEnergies = this.checkEnergyCost(items, payment["energies"]);
        if (!expEnergies.has_value()) {
            return expEnergies.as_error();
        }

        return expected({
            energies: expEnergies.value(),
            items: expItems.value()
        });
    }
}

class UserDealsController {
    user: UserModel
    dealControllers: Array<DealController>

    private constructor(user: UserModel) {
        this.user = user;
        this.dealControllers = [];
    }

    static async create(user: UserModel): Promise<UserDealsController> {
        let controller = new UserDealsController(user);

        await controller.generateDeals();
        await controller.attachDeals();

        for (let dealController of controller.dealControllers) {
            await dealController.init();
        }

        return controller;
    }

    async generateDeals() {
        // Could be generated depending on user data
        for (let dealType of Object.keys(DEAL_SCHEMAS)) {
            this.dealControllers.push(new DealController(this.user.deals, dealType));
        }
    }

    async attachDeals() {
        let toRemove: Array<string> = [];
        for (let deal of Object.values(this.user.deals.data)) {
            let attached = false;
            for (let controller of this.dealControllers) {
                if (controller.attach(deal)) {
                    attached = true;
                    break;
                }
            }

            if (!attached && deal.state !== "accepted") {   // replace with deal.state !== "accepted" ? => make it a proper function ?
                toRemove.push(deal.uid);
            }
        }

        for (let uid of toRemove) {
            await this.user.deals.removeDeal(uid);
        }
    }

    getDealController(dealUid: string): DealController | undefined {
        return this.dealControllers.find((c) => { return c.dealUid == dealUid; });
    }
};

// TODO : true singleton !
const singleton: Record<string, UserDealsController> = {};

export async function initUserDeals(user: UserModel) {
    if (user.data.uid in singleton) {
        return;
    }

    singleton[user.data.uid] = await UserDealsController.create(user);
}

// function checkDealCost(user: UserModel, payment: Payment, deal: FullDeal): Expected<Payment> {
//     let seenIds = new Set<string>();
//     for (let itemUid of payment.items) {
//         if (seenIds.has(itemUid)) {
//             return unexpected(`Payment includes duplicate item uid ${itemUid}`);
//         }
//         seenIds.add(itemUid);
//     }

//     // let paymentCopy = structuredClone(payment);

//     let paid: Payment = {
//         energies: {},
//         items: []
//     }

//     for (let costUnit of deal.cost) {
//         let res = costControllerFactory(costUnit).checkPayment(user, payment, paid);
//         if (!res.has_value()) {
//             return unexpected(`Payment invalid for deal cost unit ${JSON.stringify(costUnit)} : ${res.error()}; Payment: ${payment}`);
//         }

//         paid = res.value();
//     }

//     return expected(paid);
// }

export async function acceptDeal(userUid: string, dealUid: string, payment: Payment): Promise<Expected<AcceptDealSummary>> {
    const dataInstance = DataModel.getInstance();

    const user = dataInstance.getUser(userUid);
    if (user === null) {
        return unexpected(`No user of uid ${userUid}`, true);
    }

    const dealController = singleton[userUid]?.getDealController(dealUid);
    if (dealController === undefined) {
        return unexpected(`User of uid ${userUid} is not deal init or No deal of uid ${dealUid}`, true);
    }

    const dealExp = dealController.getDeal();
    if (!dealExp.has_value()) {
        return unexpected(`Could not get deal associated to uid ${dealUid} : ${dealExp.error()}`, true);
    }

    // TODO: not here but in controller !
    let deal = dealExp.value();
    if (deal.state !== "proposed") {
        return unexpected(`Cannot accept deal that is not in 'proposed' state (current deal state : ${deal.state})`, true);
    }

    // check if payment is valid
    let expPaid = dealController.checkCost(new UserItemsController(user), payment);
    if (!expPaid.has_value()) {
        // TODO : log cost and actual payment
        return unexpected(`Payment invalid for proposed deal of type ${deal.type} : ${expPaid.error()}`, true);
    }

    // remove paid items / energies from user inventory
    for (let unitPayment of expPaid.value().items) {
        const ret = await user.inventory.removeItemFromInventory(unitPayment.itemUid);
        if (!ret.has_value()) {
            return unexpected(`An item could not be removed from inventory : ${ret.error()}. The deal acceptance is cancelled !`, true);
        }
    }

    for (let [type, count] of Object.entries(expPaid.value().energies)) {
        const ret = await user.inventory.removeEnergy(parseType(type)!, count);
        if (!ret.has_value()) {
            return unexpected(`Energies could not be removed from inventory : ${ret.error()}. The deal acceptance is cancelled !`, true);
        }
    }

    // accept the deal
    const acceptedDealExp = await user.deals.acceptDeal(deal.uid);  // TODO : on controller instead of model ?
    if (!acceptedDealExp.has_value()) {
        return unexpected(`The deal could not be accepted : ${acceptedDealExp.error()}`, true);
    }
    
    return expected({
        acceptedDeal: DealsModel.reduceDeal(acceptedDealExp.value()),
        paidCost: expPaid.value()
    });
}

export async function redeemDeal(userUid: string, dealUid: string) : Promise<Expected<RedeemDealSummary>> {
    const dataInstance = DataModel.getInstance();

    const user = dataInstance.getUser(userUid);
    if (user === null) {
        return unexpected(`No user of uid ${userUid}`, true);
    }

    const dealController = singleton[userUid]?.getDealController(dealUid);
    if (dealController === undefined) {
        return unexpected(`User of uid ${userUid} is not deal init or No deal of uid ${dealUid}`, true);
    }

    const redeemedDealExp = await user.deals.redeemDeal(dealUid);
    if (!redeemedDealExp.has_value()) {
        return unexpected(`Error when redeeming deal of id ${dealUid}, on redeeming : ${redeemedDealExp.error()}`);
    }

    const redeemedDeal = redeemedDealExp.value();
    await dealController.handleRedeemed();

    const itemExp = await user.inventory.addItemToInventory(redeemedDeal.itemType, redeemedDeal.itemId);
    if (!itemExp.has_value()) {
        return unexpected(`Error when redeeming deal of id ${dealUid}, on adding item to inventory : ${itemExp.error()}`);
    }

    return expected({
        redeemedDeal: redeemedDeal,
        newItem: itemExp.value()
    });
}