// TODO : use enum ?
export type UserType = "guest" | "user" | "admin" | "moderator" | "banned";
export type ItemType = "card" | "booster"

export interface CardItem {
    type: "card",
    id: string,
    uid: string,
}

export interface BoosterItem {
    type: "booster",
    id: string,
    uid: string,
}

export type InventoryItem = CardItem | BoosterItem;
export type InventoryItemT<T> = 
                T extends "card" ? CardItem : 
                T extends "booster" ? BoosterItem :
                never;

export interface User {
    uid: string

    username: string
    type: UserType
}

export interface UserWithInventory extends User {
    inventory: Record<string, InventoryItem>
}