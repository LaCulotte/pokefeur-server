import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

import { type FullUser, type TradeProposal, type TradeProposalSide, type User } from "./interfaces";
import { expected, unexpected, type Expected } from "../../common/utils";

type TradesDataStructures = FullUser["trades"];

export class UserTradesModel {
    user: User;
    data: TradesDataStructures;

    constructor(user: User) {
        this.user = user;
        this.data = { proposals: {} };
    }

    static async createDirs() {
        // Nothing to do
    }

    async loadTrades() {
        // Nothing to do
    }

    async saveTrades() {
        // Nothing to do
    }

    getProposalSide(proposalUid: string) : Expected<{current: TradeProposalSide, opposite: TradeProposalSide}> {
        const proposal = this.data.proposals[proposalUid];
        if (proposal == undefined) {
            throw new Error(`Proposal of uid '${proposalUid}' not found`);
        }

        if (proposal.to.uid == this.user.uid) {
            return expected({
                current: proposal.to,
                opposite: proposal.from
            });
        }
        if (proposal.from.uid == this.user.uid) {
            return expected({
                current: proposal.from,
                opposite: proposal.to
            });
        }
        
        throw unexpected(`Proposal of uid '${proposalUid}' does not involve the user ${this.user.uid} !?`);
    }

    async acceptProposal(proposalUid: string): Promise<ReturnType<UserTradesModel["getProposalSide"]>> {
        const expectedSide = this.getProposalSide(proposalUid);
        if (!expectedSide.has_value) {
            return unexpected(`Cannot accept proposal : ${expectedSide.error()}`);
        }
        const userSide = expectedSide.value().current;

        if (userSide.accepted !== "pending") {
            return unexpected(`Cannot accept proposal : proposal is already '${userSide.accepted}'`);
        }

        userSide.accepted = "accepted";
        // TODO : trigger save ?

        return expectedSide;
        // return expectedSide.transform((sides) => expected(sides.current));
    }

    async refuseProposal(proposalUid: string): Promise<ReturnType<UserTradesModel["getProposalSide"]>> {
        const expectedSide = this.getProposalSide(proposalUid);
        if (!expectedSide.has_value) {
            return unexpected(`Cannot refuse proposal : ${expectedSide.error()}`);
        }
        const userSide = expectedSide.value().current;

        // todo : add a global state to proposal ?
        if (userSide.accepted !== "pending" && (userSide.accepted !== "accepted" || expectedSide.value().opposite.accepted !== "pending")) {
            return unexpected(`Cannot refuse proposal : proposal is already '${userSide.accepted}'`);
        }

        userSide.accepted = "refused";
        // TODO : trigger save ?

        return expectedSide;
        // return expectedSide.transform((sides) => expected(sides.current));
    }

    async completeProposal(proposalUid: string): Promise<ReturnType<UserTradesModel["getProposalSide"]>> {
        const expectedSide = this.getProposalSide(proposalUid);
        if (!expectedSide.has_value) {
            return unexpected(`Cannot refuse proposal : ${expectedSide.error()}`);
        }
        const userSide = expectedSide.value().current;

        if (userSide.accepted !== "accepted") {
            return unexpected(`Cannot complete proposal : proposal is not accepted by the user (current state: '${userSide.accepted}')`);
        }

        userSide.accepted = "completed";
        // TODO : trigger save ?

        return expectedSide;
        // return expectedSide.transform((sides) => expected(sides.current));
    }

    async removeProposal(proposalUid: string): Promise<Expected<void>> {
        if (this.data.proposals[proposalUid] == undefined) {
            return unexpected(`No proposal of uid ${proposalUid} in the trades of user ${this.user.uid}`);
        }
        
        delete this.data.proposals[proposalUid];
        
        return expected(undefined);
    }
}