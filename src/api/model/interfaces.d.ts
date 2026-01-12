// TODO : use enum ?
export type UserType = "guest" | "user" | "admin" | "moderator" | "banned";
export type ItemType = "card" | "booster"

export interface CardItem {
    type: "card"
    id: string
    uid: string
}

export interface BoosterItem {
    type: "booster"
    id: string
    uid: string
}

export type InventoryItem = CardItem | BoosterItem
export type InventoryItemT<T> = 
                T extends "card" ? CardItem : 
                T extends "booster" ? BoosterItem :
                never

export interface DealCostCard {
    type: "card"
    id: string
}

export interface DealCostEnergy {
    type: "energy"
    id: Type
}

export type DealCostUnit = CardItem | BoosterItem
export type DealCostUnitT<T> = 
                T extends "card" ? DealCostCard : 
                T extends "energy" ? DealCostEnergy :
                never

// TODO : rename in smth better
export type DealType = "simple" | "specific"

export interface ProposedDeal {
    type: DealType

    cost: Array<DealCostUnit>
    totalWaitTime: number   // In seconds
}

export interface Deal {
    uid: string
    type: DealType

    totalWaitTime: number   // In seconds
    startDate: number       // Date.now in seconds
}

export interface FullDeal extends Deal {
    itemType: ItemType
    itemId: string
}

export interface User {
    uid: string

    username: string
    type: UserType
}

export interface FullUser extends User {
    inventory: Record<string, InventoryItem>
    deals: Record<string, Deal>
}