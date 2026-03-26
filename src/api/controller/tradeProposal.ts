import type { InventoryItem, TradeProposal, TradeProposalSide } from "../model/interfaces";
import { type Expected, expected, unexpected } from "../../common/utils";
import { DataModel } from "../model/DataModel";

/**
 * Note for future architecture ?
 * => Make controller functions more local to user instead of managing them both in the same functions
 */

export async function makeTradeProposal(fromUserUid: string, 
    toUserUid: string, 
    offeredItemUids: Array<string>, 
    requestedItemUids: Array<string>) 
: Promise<Expected<TradeProposal>> 
{
    const dataInstance = DataModel.getInstance();

    const fromUser = dataInstance.getUser(fromUserUid);
    if (fromUser === null) {
        return unexpected(`No user of uid ${fromUserUid}`, true);
    }

    const fromItems: Array<InventoryItem> = [];
    for (let itemUid of offeredItemUids) {
        let item = fromUser.inventory.data.items[itemUid];
        if (item === undefined) {
            return unexpected(`No item of uid ${itemUid} in inventory of user ${fromUserUid}`, true);
        }

        fromItems.push(item);
    }

    const toUser = dataInstance.getUser(toUserUid);
    if (toUser === null) {
        return unexpected(`No user of uid ${toUserUid}`, true);
    }

    const toItems: Array<InventoryItem> = [];
    for (let itemUid of requestedItemUids) {
        let item = toUser.inventory.data.items[itemUid];
        if (item === undefined) {
            return unexpected(`No item of uid ${itemUid} in inventory of user ${toUserUid}`, true);
        }

        toItems.push(item);
    }

    let proposalExp = await dataInstance.tradeProposals.createProposal(fromUser, toUser, fromItems, toItems);

    if (!proposalExp.has_value()) {
        return unexpected(`Error while creating trade proposal : ${proposalExp.error()}`, true);
    }

    for (let item of fromItems) {
        let expRemoved = await fromUser.inventory.moveItemToTrade(item.uid);
        if (!expRemoved.has_value()) {
            for (let rollbackItem of fromItems) {
                fromUser.inventory.moveItemFromTrade(rollbackItem.uid);
            }

            return unexpected(`Error while moving item of uid ${item.uid} to user's trade inventory : ${expRemoved.error()}`, true);
        }
    }

    return proposalExp;
}

export async function acceptTradeProposal(userUid: string, proposalUid: string): Promise<Expected<TradeProposal>> {
    const dataInstance = DataModel.getInstance();

    const proposal = dataInstance.tradeProposals.data[proposalUid];
    if (proposal === undefined) {
        return unexpected(`No proposal of uid ${proposalUid}`, true);
    }

    const fromUser = dataInstance.getUser(proposal.from.uid);
    const toUser = dataInstance.getUser(proposal.to.uid);

    if (fromUser === null || toUser === null) {
        return unexpected(`Invalid proposal of uid ${proposalUid} : unknown users`, true);
    }

    const user = fromUser.data.uid === userUid ? fromUser : toUser.data.uid === userUid ? toUser : null;
    if (user === null) {
        return unexpected(`User ${userUid} is not part of proposal ${proposalUid} !`, true);
    }

    const acceptProposalExp = await user.trades.acceptProposal(proposalUid);
    await dataInstance.tradeProposals.saveProposals();
    if (!acceptProposalExp.has_value()) {
        return unexpected(`Error while accepting trade proposal of uid ${proposalUid} for user ${userUid} : ${acceptProposalExp.error()}`, true);
    }

    for (let item of acceptProposalExp.value().items) {
        let expMoved = await user.inventory.moveItemToTrade(item.uid);
        if (!expMoved.has_value()) {
            for (let rollbackItem of acceptProposalExp.value().items) {
                await user.inventory.moveItemFromTrade(rollbackItem.uid);
            }

            return unexpected(`Error while moving item of uid ${item.uid} from trade inventory to user inventory for user ${userUid} : ${expMoved.error()}`, true);
        }
    }

    if (proposal.to.accepted === "accepted" && proposal.from.accepted === "accepted") {
        for (let item of proposal.from.items) {
            await fromUser.inventory.removeTradeItem(item.uid);
        }

        for (let item of proposal.to.items) {
            await toUser.inventory.removeTradeItem(item.uid);
        }

        proposal.acceptedDate = Math.floor(Date.now() / 1000)
    }

    // TODO : auto-refuse all un-acceptable trade requests ?
    //          => allow for counter offers !

    return expected(proposal);
}

export async function refuseTradeProposal(userUid: string, proposalUid: string): Promise<Expected<TradeProposal>> {
    const dataInstance = DataModel.getInstance();

    const proposal = dataInstance.tradeProposals.data[proposalUid];
    if (proposal === undefined) {
        return unexpected(`No proposal of uid ${proposalUid}`, true);
    }

    const fromUser = dataInstance.getUser(proposal.from.uid);
    const toUser = dataInstance.getUser(proposal.to.uid);

    if (fromUser === null || toUser === null) {
        return unexpected(`Invalid proposal of uid ${proposalUid} : unknown users`, true);
    }

    const user = fromUser.data.uid === userUid ? fromUser : toUser.data.uid === userUid ? toUser : null;
    if (user === null) {
        return unexpected(`User ${userUid} is not part of proposal ${proposalUid} !`, true);
    }

    const refuseProposalExp = await user.trades.refuseProposal(proposalUid);
    await dataInstance.tradeProposals.saveProposals();
    if (!refuseProposalExp.has_value()) {
        return unexpected(`Error while refusing trade proposal of uid ${proposalUid} for user ${userUid} : ${refuseProposalExp.error()}`, true);
    }

    for (let item of proposal.from.items) {
        await fromUser.inventory.moveItemFromTrade(item.uid);
    }

    for (let item of proposal.to.items) {
        await toUser.inventory.moveItemFromTrade(item.uid);
    }

    return expected(proposal);
}

export async function completeTradeProposal(userUid: string, proposalUid: string): Promise<Expected<TradeProposal>> {
    const dataInstance = DataModel.getInstance();

    const proposal = dataInstance.tradeProposals.data[proposalUid];
    if (proposal === undefined) {
        return unexpected(`No proposal of uid ${proposalUid}`, true);
    }

    if ((proposal.to.accepted != "accepted" && proposal.to.accepted != "completed") 
        || (proposal.from.accepted != "accepted" && proposal.from.accepted != "completed")) {
        return unexpected(`Trade proposal of ${proposalUid} is not accepted by both side! \
            (From accepted: ${proposal.from.accepted}, To accepted: ${proposal.to.accepted})`, true);
    }

    const user = dataInstance.getUser(userUid);
    if (user === null) {
        return unexpected(`No user of uid ${userUid}`, true);
    }

    const completeProposalExp = await user.trades.completeProposal(proposalUid);
    await dataInstance.tradeProposals.saveProposals();

    if (!completeProposalExp.has_value()) {
        return unexpected(`Error while completing trade proposal of uid ${proposalUid} for user ${userUid} : ${completeProposalExp.error()}`, true);
    }

    const { opposite: oppositeSide } = user.trades.getProposalSide(proposalUid).value();
    for (let item of oppositeSide.items) {
        const exp = await user.inventory.addItemToInventory(item.type, item.id);
        if (!exp.has_value()) {
            console.error(`Error while adding item ${JSON.stringify(item)} to inventory of user ${userUid} during completion of trade proposal ${proposalUid} : ${exp.error()}`);
        }
    }

    return expected(proposal);
}
