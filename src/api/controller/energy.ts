import { expected, unexpected, type Expected } from "../../common/utils";
import { DataModel } from "../model/DataModel";
import { StaticDataSingleton } from "../staticData/loader";

import { Category, SUPPORTED_ENERGY_TYPES, Type } from "../../common/constants";

export async function recycleCards(userUid: string, cardUids: Array<string>) : Promise<Expected<Array<Type>>> {
    if (cardUids.length == 0) {
        return unexpected(`List of cards to recycle is empty !`);
    }
    
    const dataInstance = DataModel.getInstance();
    const staticDataInstance = StaticDataSingleton.getInstance();

    const user = dataInstance.getUser(userUid);
    if (user === null) {
        return unexpected(`No user of uid ${userUid}`, true);
    }

    const energies: Array<Type> = [];
    for (let cardUid of cardUids) {
        const item = user.inventory.data.items[cardUid];

        if (item === undefined || item.type !== "card") {
            return unexpected(`No booster of uid ${cardUid} for user of uid ${userUid}`, true);
        }

        const cardData = staticDataInstance.staticData.cards[item.id];
        if (cardData === undefined) {
            return unexpected(`Id '${item.id} is not a valid card id !'`, true);
        }

        if (![Category.POKEMON, Category.ENERGY].includes(cardData.category) || cardData.types === undefined) {
            return unexpected(`Card of id ${item.id} is not recyclable (${cardData.name}).`, true);
        }

        for (let energy of cardData.types) {
            if (!SUPPORTED_ENERGY_TYPES.includes(energy)) {
                return unexpected(`Card of id ${item.id} is not recyclable because it \
would produce an energy of type ${energy} which is not currently supported.`, true);
            }
            energies.push(energy);
        }
    }

    for (let cardUid of cardUids) {
        await user.inventory.removeItemFromInventory(cardUid);
    }

    for (let energy of energies) {
        let expEnergy = await user.inventory.addEnergy(energy);
        if (!expEnergy.has_value()) {
            return unexpected(`Got error when recycling cards ${cardUids} : ${expEnergy.error()}`, true);
        }
    }

    return expected(energies);
}
