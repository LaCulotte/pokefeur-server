import { expected, unexpected, type Expected } from "../../common/utils";
import { DataModel } from "../model/DataModel";
import { StaticDataSingleton } from "../staticData/loader";

import type { CardItem } from "../model/interfaces";

export async function openBooster(userUid: string, boosterUid: string) : Promise<Expected<Array<CardItem>>> {
    const dataInstance = DataModel.getInstance();
    const staticDataInstance = StaticDataSingleton.getInstance();

    const user = dataInstance.getUser(userUid);
    if (user === undefined) {
        return unexpected(`No user of uid ${userUid}`, true);
    }

    const boosterItem = user.inventory.data.items[boosterUid];
    if (boosterItem === undefined || boosterItem.type !== "booster") {
        return unexpected(`No booster of uid ${boosterUid} for user of uid ${userUid}`, true);
    }

    const expRemoved = await user.inventory.removeItemFromInventory(boosterUid);
    if (!expRemoved.has_value) {
        return unexpected(`Cannot open booster : ${expRemoved.error()}`, true);
    }

    const set = staticDataInstance.staticData.sets[boosterItem.id];
    if (set === undefined) {
        return unexpected(`Cannot open booster : ${boosterItem.id} is not a valid set id`);
    }

    const cardsKeys = Object.keys(set.cards);
    if (cardsKeys.length == 0) {
        return unexpected(`No card in set ${set.id} ! (cards : ${set.cards})`, true);
    }
    
    const generatedIds: Array<string> = [];
    for(let i = 0; i < 10; i++) {
        const cardIndex = Math.floor(Math.random() * cardsKeys.length);
        const cardId = cardsKeys[cardIndex];

        if (cardId === undefined) {
            return unexpected(`Got undefined card when opening booster of ${set.id}`, true);
        }

        generatedIds.push(cardId);
    }

    // TODO : remove Item from inventory here !!

    const ret: Array<CardItem> = [];
    for (const id of generatedIds) {
        const generatedCard = await user.inventory.addItemToInventory("card", id);

        if (generatedCard.has_value) {
            ret.push(generatedCard.value());
        } else {
            return unexpected(`Got error while trying to add cards to inventory : ${generatedCard.error()}`, true);   // TODO : continue generating cards ?
        }
    }

    return expected(ret);
}