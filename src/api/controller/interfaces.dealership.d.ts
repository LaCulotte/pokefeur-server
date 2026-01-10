import type { Deal, InventoryItem } from "../model/interfaces";

export interface AddDealSummary {
    deal: Deal
    paidItemUids: Array<string>
};

export interface RedeemDealSummary {
    redeemedDeal: Deal
    newItem: InventoryItem
};