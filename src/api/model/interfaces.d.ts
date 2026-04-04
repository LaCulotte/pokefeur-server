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

export interface DealCostCardOfType {
    type: "card-of-type"
    id: Type
}

export interface DealCostCardOfSet {
    type: "card-of-set"
    id: string
}

export interface DealCostCardOfPokemon {
    type: "card-of-pokemon"
    id: number
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

export type DealCostUnit = DealCostCard | DealCostBooster | DealCostCardOfSet | DealCostCardOfType | DealCostCardOfPokemon // | DealCostEnergy
export type DealCostUnitT<T> = 
                T extends "card" ? DealCostCard : 
                T extends "card-of-type" ? DealCostCardOfType : 
                T extends "card-of-set" ? DealCostCardOfSet : 
                T extends "card-of-pokemon" ? DealCostCardOfPokemon :
                T extends "booster" ? DealCostBooster : 
                T extends "energy" ? DealCostEnergy :
                never

export type DealState = "proposed" | "accepted" | "redeemed";

export interface Deal {
    state: DealState

    uid: string
    type: string

    cost: {
        items: Array<DealCostUnit>,
        energies: Partial<Record<Type, number>>
    }

    totalWaitTime: number   // In seconds
    timeoutDuration: number // In seconds
    
    proposedDate: number
    startDate: number | undefined   // Date.now in seconds
}

export interface FullDeal extends Deal {
    itemType: ItemType
    itemId: string
}

export interface ItemPayment {
    itemUid: string, 
    costIndex: number
}

export interface Payment {
    energies: Partial<Record<Type, number>>
    items: Array<ItemPayment>
}

export interface User {
    uid: string

    username: string
    description?: string

    type: UserType
}

export type UserSearchResult = Pick<User, 'uid' | 'username' | 'description'>

export interface FullUser extends User {
    inventory: {
        items: Record<string, InventoryItem>,
        inTradeItems: Record<string, InventoryItem>,
        energies: Partial<Record<Type, number>>
    }
    deals: Record<string, Deal>
    trades: {
        proposals: Record<string, TradeProposal>        
    }
}

// TODO !
// export enum AcceptState {
//     ACCEPTED = 0,
//     REFUSED,
//     PENDING,
//     COMPLETED
// }

type AcceptState = "accepted" | "refused" | "pending" | "completed";

export interface TradeProposal {
    uid: string,
    proposalDate: number,
    acceptedDate: number | undefined,
    from: {
        uid: string
        items: Array<InventoryItem>
        accepted: AcceptState
    }
    to: {
        uid: string
        items: Array<InventoryItem>
        accepted: AcceptState
    }
}

export type TradeProposalSide = TradeProposal["to"] | TradeProposal["from"]