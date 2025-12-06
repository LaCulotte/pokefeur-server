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

// export interface InventoryItem {
//     type: ItemType,
//     id: string,
//     uid: string
// }

export type InventoryItem = CardItem | BoosterItem;

export interface User {
    uid: string

    username: string
    type: UserType
}

export interface UserWithInventory extends User {
    inventory: Record<string, InventoryItem>
}