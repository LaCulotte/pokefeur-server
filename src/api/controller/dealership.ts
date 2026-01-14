import { DataModel } from "../model/DataModel";
import { StaticDataSingleton } from "../staticData/loader";

import { expected, unexpected, type Expected } from "../../common/utils";
import type { ItemType } from "../model/interfaces";
import type { AddDealSummary, RedeemDealSummary } from "./interfaces.dealership"


export async function addDeal(userUid: string, itemUidsToPay: Array<string>) : Promise<Expected<AddDealSummary>> {
    const dataInstance = DataModel.getInstance();
    const staticDataInstance = StaticDataSingleton.getInstance();

    const user = dataInstance.getUser(userUid);
    if (user === null) {
        return unexpected(`No user of uid ${userUid}`, true);
    }

    if (Object.keys(user.deals.data).length > 0) {
        return unexpected(`${user.data.uid} (${user.data.username}) already has the maximum number of deals`);
    }

    const itemUidsToPaySet: Set<string> = new Set(itemUidsToPay);
    let paidItemUids: Array<string> = [];

    for (let itemUid of itemUidsToPaySet) {
        let item = user.inventory.data.items[itemUid];
        if (item === undefined) {
            continue;
        }

        if (item.type === "card") {
            paidItemUids.push(itemUid);

            if (paidItemUids.length === 5)
                break;
        }
    }

    if (paidItemUids.length < 5) {
        return unexpected(`Not enough valid card to get a deal`, true);
    }

    let dealItemType: ItemType = "booster"
    let waitTime = 60;  // 20 seconds

    const sets = Object.keys(staticDataInstance.staticData.sets);
    let i = Math.floor(Math.random() * sets.length);
    let dealItemId = sets[i];

    if (dealItemId === undefined) {
        return unexpected(`Got undefined item id ${dealItemId} (type: ${dealItemType}) when generating a deal`, true);
    }

    for (let itemUid of paidItemUids) {
        let ret = await user.inventory.removeItemFromInventory(itemUid);
        if (!ret.has_value()) {
            return unexpected(`An item could not be removed from inventory : ${ret.error()}. The deal is cancelled !`, true);
        }
    }

    let deal = await user.deals.addDeal("items", dealItemType, dealItemId, waitTime);
    if (!deal.has_value()) {
        return unexpected(`The deal could not be made : ${deal.error()}`, true);
    }

    return expected({
        deal: deal.value(),
        paidItemUids
    });
}

export async function redeemDeal(userUid: string, dealUid: string) : Promise<Expected<RedeemDealSummary>> {
    const dataInstance = DataModel.getInstance();
    const staticDataInstance = StaticDataSingleton.getInstance();

    const user = dataInstance.getUser(userUid);
    if (user === null) {
        return unexpected(`No user of uid ${userUid}`, true);
    }

    const dealEx = await user.deals.redeemDeal(dealUid);
    if (!dealEx.has_value()) {
        return unexpected(`Error when redeeming deal of id ${dealUid} : ${dealEx.error()}`);
    }

    const deal = dealEx.value();

    const itemEx = await user.inventory.addItemToInventory(deal.itemType, deal.itemId);
    if (!itemEx.has_value()) {
        return unexpected(`Error when redeeming deal of id ${dealUid}, on adding item to inventory : ${itemEx.error()}`);
    }

    return expected({
        redeemedDeal: deal,
        newItem: itemEx.value()
    });
}