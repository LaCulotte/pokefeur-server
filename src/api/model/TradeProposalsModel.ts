import fs from "fs/promises"
import { v4 as uuidv4 } from "uuid"

import type { InventoryItem, TradeProposal } from "./interfaces";
import { expected, unexpected, type Expected } from "../../common/utils";

import { DataModel } from "./DataModel";
import type { UserModel } from "./UserModel";

export class TradeProposalsModel {
    data: Record<string, TradeProposal>

    constructor() {
        this.data = {};
    }

    static async createDirs() {
        await fs.mkdir("./data/", {
            recursive: true
        });
    }

    async loadProposals() {
        try {
            this.data = await fs.readFile(`./data/tradeProposals.json`, "utf-8").then((data) => { return JSON.parse(data) });
        } catch (e) {
            console.warn(`Could not load trade proposals !`);

            this.data = {};
            this.saveProposals();
        }
    }
    
    async saveProposals() {
        await fs.writeFile(`./data/tradeProposals.json`, JSON.stringify(this.data ?? {}), "utf-8");
    }

    attachToUsers() {
        const dataInstance = DataModel.getInstance();
        let toRemove: string[] = [];

        for (let proposal of Object.values(this.data)) {
            const fromUser = dataInstance.users[proposal.from.uid];
            const toUser = dataInstance.users[proposal.to.uid];
            
            if (fromUser == undefined || toUser == undefined) {
                console.warn(`Proposal ${proposal.uid} has invalid users !`);
                toRemove.push(proposal.uid);
                continue;
            }

            fromUser.trades.data.proposals[proposal.uid] = proposal;
            toUser.trades.data.proposals[proposal.uid] = proposal;
        }

        for (let uid of toRemove) {
            delete this.data[uid];
        }
    }

    async createProposal(fromUser: UserModel, toUser: UserModel, fromItems: Array<InventoryItem>, toItems: Array<InventoryItem>): Promise<Expected<TradeProposal>> {
        let uid = uuidv4();
        while (uid in this.data) {
            uid = uuidv4();
        }
        
        let proposal: TradeProposal = {
            uid: uid,
            from: {
                uid: fromUser.data.uid,
                items: fromItems,
                accepted: "accepted"
            },
            to: {
                uid: toUser.data.uid,
                items: toItems,
                accepted: "pending"
            },
            proposalDate: Math.floor(Date.now() / 1000),
            acceptedDate: undefined
        }

        this.data[proposal.uid] = proposal;
        fromUser.trades.data.proposals[proposal.uid] = proposal;
        toUser.trades.data.proposals[proposal.uid] = proposal;

        fromUser.trades.acceptProposal(proposal.uid);

        await this.saveProposals();

        return expected(proposal);
    }

    async removeProposal(proposalUid: string): Promise<Expected<TradeProposal>> {
        const proposal = this.data[proposalUid];
        if (proposal === undefined) {
            return unexpected(`No proposal of uid ${proposalUid} found`);
        }

        delete this.data[proposalUid];

        const dataInstance = DataModel.getInstance();

        const fromUser = dataInstance.users[proposal.from.uid];
        const toUser = dataInstance.users[proposal.to.uid];
        
        delete fromUser?.trades.data.proposals[proposalUid];
        delete toUser?.trades.data.proposals[proposalUid];

        await this.saveProposals();

        return expected(proposal);
    }
}