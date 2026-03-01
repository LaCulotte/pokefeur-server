import type { Deal, DealCostUnit, InventoryItem, Payment, FullDeal } from "../model/interfaces";

export interface AcceptDealSummary {
    acceptedDeal: Deal & { itemType?: never; itemId?: never }
    paidCost: Payment
}

export interface RedeemDealSummary {
    redeemedDeal: FullDeal
    newItem: InventoryItem
}