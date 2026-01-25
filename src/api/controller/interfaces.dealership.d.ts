import type { Deal, DealCostUnit, InventoryItem } from "../model/interfaces";

export interface AcceptDealSummary {
    acceptedDeal: Deal & { itemType?: never; itemId?: never }
    paidCost: Payment
}

export interface RedeemDealSummary {
    redeemedDeal: Deal
    newItem: InventoryItem
}