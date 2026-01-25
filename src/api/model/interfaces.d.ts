import type { Type } from "../../common/constants";

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

export interface DealCostBooster {
    type: "booster"
    id: string
}

export interface DealCostEnergy {
    type: "energy"
    id: Type
    count: number
}

export type DealCostUnit = DealCostCard | DealCostBooster | DealCostEnergy
export type DealCostUnitT<T> = 
                T extends "card" ? DealCostCard : 
                T extends "booster" ? DealCostCard : 
                T extends "energy" ? DealCostEnergy :
                never

// TODO : make it dynamic
//      => json mapping dealtype to types of unit costs and types of rewards ?
export type DealType = "energies" | "items"


export type DealState = "proposed" | "accepted" | "redeemed";

export interface Deal {
    state: DealState

    uid: string
    type: string

    cost: Array<DealCostUnit>

    totalWaitTime: number   // In seconds
    timeoutDuration: number // In seconds
    
    proposedDate: number
    startDate: number | undefined   // Date.now in seconds
}

export interface FullDeal extends Deal {
    itemType: ItemType
    itemId: string
}

export interface Payment {
    energies: Partial<Record<Type, number>>   
    items: Array<string>,   // item uids
}

export interface User {
    uid: string

    username: string
    type: UserType
}

export interface FullUser extends User {
    inventory: {
        items: Record<string, InventoryItem>
        energies: Partial<Record<Type, number>>
    }
    deals: Record<string, Deal>
}