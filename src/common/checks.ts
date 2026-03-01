import type { StaticData } from "../api/staticData/interfaces";
import type { InventoryItem } from "../api/model/interfaces";
import type { Type } from "./constants";

// export function isItemCardOfId(data: BackendData, cardId: string, item: InventoryItem) {
//     return item.id == "card" && cardId == item.id;
// }

export function isCardOfType(data: StaticData, cardId: string, type: Type) {
    const cardData = data.cards[cardId];
    if (cardData === undefined || cardData.types === undefined) {
        return false;
    }

    return cardData.types.includes(type);
}

export function isCardOfSet(data: StaticData, cardId: string, setId: string) {
    const cardData = data.cards[cardId];
    if (cardData === undefined) {
        return false;
    }

    return cardData.setId == setId;
}