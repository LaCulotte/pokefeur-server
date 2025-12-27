import { expected, unexpected, type Expected } from "../../common/utils";
import { DataSingleton } from "../data/data";
import type { BoosterItem, CardItem } from "../data/interfaces";
import { StaticDataSingleton } from "../staticData/loader";

export function openBooster(userUid: string, boosterUid: string) : Expected<Array<CardItem>> {
    const dataInstance = DataSingleton.getInstance();
    const staticDataInstance = StaticDataSingleton.getInstance();

    const user = dataInstance.getUser(userUid);
    if (user === null) {
        return unexpected(`No user of uid ${userUid}`, true);
    }

    const inventory = user.inventory;
    const boosterItem = inventory[boosterUid];

    if (boosterItem === undefined || boosterItem.type !== "booster") {
        return unexpected(`No item of uid ${boosterUid}`, true);
    }

    let expRemoved = dataInstance.removeItemFromInventory(userUid, boosterUid);
    if (!expRemoved.has_value()) {
        return unexpected(`Cannot open booster : ${expRemoved.error()}`, true);
    }

    let set = staticDataInstance.staticData.sets[boosterItem.id];
    if (set === undefined) {
        return unexpected(`Cannot open booster : ${boosterItem.id} is not a valid set id`)
    }

    let cardsKeys = Object.keys(set.cards);
    if (cardsKeys.length == 0) {
        return unexpected(`No card in set ${set.id} ! (cards : ${set.cards})`);
    }
    
    let generatedIds: Array<string> = [];
    for(let i = 0; i < 10; i++) {
        let i = Math.floor(Math.random() * cardsKeys.length);
        let cardId = cardsKeys[i];

        if (cardId === undefined) {
            return unexpected(`Got undefined card when opening booster of ${set.id}`);
        }

        generatedIds.push(cardId);
    }

    let ret: Array<CardItem> = [];
    for (let id of generatedIds) {
        let generatedCard = dataInstance.addItemToInventory(userUid, "card", id);

        if (generatedCard.has_value()) {
            ret.push(generatedCard.value());
        } else {
            return unexpected(`Got error while trying to add cards to inventory : ${generatedCard.error()}`);   // TODO : continue generating cards ?
        }
    }

    return expected(ret);
}