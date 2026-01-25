import { DataModel } from "../model/DataModel";
import { StaticDataSingleton } from "../staticData/loader";

import { expected, unexpected, type Expected } from "../../common/utils";
import type { DealCostBooster,
    DealCostCard,
    DealCostEnergy,
    DealCostUnit,
    FullDeal,
    ItemType,
    Payment } from "../model/interfaces";
import type { AcceptDealSummary, RedeemDealSummary } from "./interfaces.dealership"
import { Type } from "../../common/constants";
import type { UserModel } from "../model/UserModel";
import { DealsModel } from "../model/DealsModel";


class DealController {
    deals: DealsModel;
    
    type: string;
    dealUid: string | undefined;

    updateTimeout: NodeJS.Timeout | undefined;

    constructor(deals: DealsModel, type: string) {
        this.deals = deals;
        this.type = type;

        this.dealUid = undefined;
        this.updateTimeout = undefined;
    }

    attach(deal: FullDeal): boolean {
        if (this.dealUid !== undefined) {
            return false;
        }

        if(deal.type != this.type) {
            return false;
        }

        this.dealUid = deal.uid;
        return true;
    }

    generateCost(): Array<DealCostUnit> {
        // TODO : make it depend on an external json
        // TODO : randomize
        if (this.type === "energies") {
            return [
                {type: "energy", id: Type.COLORLESS, count: 1},
                {type: "card", id: "base1-2"},
                {type: "booster", id: "base1"},
                {type: "energy", id: Type.FIGHTING, count: 1},
            ];
        } else if (this.type === "card") {
            return [
                {type: "card", id: "base1-1"}
            ];
        }

        throw new Error(`Unkown deal type ${this.type}`)
    }

    generateReward(): {type: ItemType, id: string} {
        // TODO : make it depend on an external json
        const staticDataInstance = StaticDataSingleton.getInstance();
        const sets = Object.keys(staticDataInstance.staticData.sets);

        let dealItemType: ItemType = "booster"
        let dealItemId = sets[Math.floor(Math.random() * sets.length)]!;

        return {
            type: dealItemType,
            id: dealItemId,
        }
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
        let reward = this.generateReward()
        let expDeal = await this.deals.addDeal(this.type, this.generateCost(), reward.type, reward.id, 30, 20);

        if (!expDeal.has_value()) {
            // TODO : do not generate an error ?
            throw new Error(`Cannot generate new deal ?? Reason : ${expDeal.error()}`);
        }

        this.dealUid = expDeal.value().uid;

        if (this.updateTimeout !== undefined) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(() => { this.handleExpired(); }, expDeal.value().timeoutDuration * 1000);
    }

    async update() {
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
        if (!dealExp.has_value()) {
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
        if (!dealExp.has_value()) {
            await this.generateDeal();
            // save
            return;
        }

        let deal = dealExp.value();
        let now = Math.floor(Date.now() / 1000);

        if (this.updateTimeout === undefined) {
        // if (deal.proposedDate + deal.timeoutDuration < now) {
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
            await dealController.update();
        }

        return controller;
    }

    async generateDeals() {
        // Could be generated depending on user data
        this.dealControllers.push(new DealController(this.user.deals, "energies"));
        this.dealControllers.push(new DealController(this.user.deals, "card"));
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

            if (!attached && deal.state === "proposed") {
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

function checkDealCostItem(user: UserModel, cost: DealCostBooster | DealCostCard, payment: Payment, paid: Payment) : Expected<undefined> {
    let itemIndex = payment.items.findIndex((itemUid) => {
        return cost.id == user.inventory.data.items[itemUid]?.id;
    });

    if (itemIndex === -1) {
        return unexpected(`Payment does not include item of id ${cost.id}.`);
    }

    let itemUid = payment.items[itemIndex]!;
    paid.items.push(itemUid);
    payment.items.splice(itemIndex, 1);
    
    return expected(undefined);
}

function checkDealCostEnergy(user: UserModel, cost: DealCostEnergy, payment: Payment, paid: Payment) : Expected<undefined> {
    // Check if payment is ok
    let paymentEnergy = payment.energies[cost.id];
    if (paymentEnergy === undefined || paymentEnergy < cost.count) {
        return unexpected(`Payment does include enough energy of type ${cost.id} (got ${paymentEnergy ?? 'none'}, needs ${cost.count})`);
    }
    
    // Check if user has enough energies
    let userEnergy = user.inventory.data.energies[cost.id];
    if (userEnergy === undefined || userEnergy < cost.count) {
        return unexpected(`User ${user.data.uid} (${user.data.username}) does not have enough energy of type ${cost.id} \
(has ${userEnergy ?? 'none'}, needs ${cost.count})`);
    }

    paid.energies[cost.id] = (paid.energies[cost.id] ?? 0) + cost.count;
    return expected(undefined);
}

// TODO : in future, the Model class should manage much more data
//      => Should have serialize/deserialize methods
//      => Should class should be created depending on dealcostunit type
function checkPayment(user: UserModel, cost: DealCostUnit, payment: Payment, paid: Payment) : Expected<undefined> {
    switch (cost.type) {
        case "card":
        case "booster":
            return checkDealCostItem(user, cost, payment, paid);
        case "energy":
            return checkDealCostEnergy(user, cost, payment, paid);
        default:
            return unexpected(`Unknown deal cost type ${(cost as DealCostUnit).type}`);
    }
}

function checkDealCost(user: UserModel, payment: Payment, deal: FullDeal): Expected<Payment> {
    let seenIds = new Set<string>();
    for (let itemUid of payment.items) {
        if (seenIds.has(itemUid)) {
            return unexpected(`Payment includes duplicate item uid ${itemUid}`);
        }
        seenIds.add(itemUid);
    }

    let paymentCopy = structuredClone(payment);

    let paid: Payment = {
        energies: {},
        items: []
    }

    for (let costUnit of deal.cost) {
        let res = checkPayment(user, costUnit, paymentCopy, paid);
        if (!res.has_value()) {
            return unexpected(`Payment invalid for deal cost unit ${JSON.stringify(costUnit)} : ${res.error()}`);
        }
    }

    return expected(paid);
}

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

    let deal = dealExp.value();
    if (deal.state !== "proposed") {
        return unexpected(`Cannot accept deal that is not in 'proposed' state (current deal state : ${deal.state})`, true);
    }

    // check if payment is valid
    let expPayment = checkDealCost(user, payment, deal);
    if (!expPayment.has_value()) {
        // TODO : log cost and actual payment
        return unexpected(`Payment invalid for proposed deal of type ${deal.type} : ${expPayment.error()}`, true);
    }

    // remove paid items / energies from user inventory
    for (let itemUid of expPayment.value().items) {
        let ret = await user.inventory.removeItemFromInventory(itemUid);
        if (!ret.has_value()) {
            return unexpected(`An item could not be removed from inventory : ${ret.error()}. The deal acceptance is cancelled !`, true);
        }
    }

    for (let [energyType, count] of Object.entries(expPayment.value().energies)) {
        await user.inventory.removeEnergy(parseInt(energyType) as Type, count);
    }

    // accept the deal
    const acceptedDealExp = await user.deals.acceptDeal(deal.uid);
    if (!acceptedDealExp.has_value()) {
        return unexpected(`The deal could not be accepted : ${acceptedDealExp.error()}`, true);
    }
    
    return expected({
        acceptedDeal: DealsModel.reduceDeal(acceptedDealExp.value()),
        paidCost: expPayment.value()
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