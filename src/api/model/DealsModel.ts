import fs from "fs/promises"
import { v4 as uuidv4 } from "uuid"

import type { ItemType, Deal, User, FullDeal, DealCostUnit } from "./interfaces"
import { StaticDataSingleton } from "../staticData/loader";
import { Expected, expected, unexpected } from "../../common/utils";

export class DealsModel {
    user: User

    data: Record<string, FullDeal>

    currLock: Promise<any> | undefined;
    
    constructor(user: User) {
        this.user = user;
        this.data = {};
        
        this.currLock = undefined;
    }

    static async createDirs() {
        await fs.mkdir("./data/deals/", {
            recursive: true
        });
    }

    async loadDeals() {
        try {
            this.data = await fs.readFile(`./data/deals/${this.user.uid}.json`, "utf-8").then((data) => { return JSON.parse(data) });

            // TODO : sanatize deals ?
            // TODO : reset deal data 
        } catch (e) {
            console.warn(`Could not load deals for user ${this.user.username} (uid: ${this.user.uid})`);

            this.data = {};
            this.saveDeals();
        }
    }

    async saveDeals() {
        // TODO : not that
        while (this.currLock != undefined) {
            await this.currLock;
        }

        this.currLock = new Promise(
            async (res, rej) => {
                await fs.writeFile(`./data/deals/${this.user.uid}.json`, JSON.stringify(this.data ?? {}), "utf-8");
                this.currLock = undefined;
                res(undefined);
            }
        );
    }

    static reduceDeal(deal: FullDeal) : Deal {
        return {
            state: deal.state,
            uid: deal.uid,
            type: deal.type,
            cost: deal.cost,

            timeoutDuration: deal.timeoutDuration,
            totalWaitTime: deal.totalWaitTime,
            proposedDate: deal.proposedDate,
            startDate: deal.startDate,
        }
    }

    getReducedData() : Record<string, Deal> {
        let ret: Record<string, Deal> = {};
        
        for (let [uid, deal] of Object.entries(this.data)) {
            ret[uid] = DealsModel.reduceDeal(deal);
        }

        return ret;
    }

    async addDeal(dealType: string, cost: Array<DealCostUnit>, itemType: ItemType, itemId: string, timeoutDuration: number, totalWaitTime: number) : Promise<Expected<FullDeal>> {
        let uid = uuidv4();

        while (uid in this.data) {
            uid = uuidv4();
        }
        
        let newDeal: FullDeal = {
            state: "proposed",
            uid,
            type: dealType,
            cost,

            timeoutDuration,
            totalWaitTime,

            proposedDate: Math.floor(Date.now() / 1000),
            startDate: undefined,
            
            itemType,
            itemId
        }

        this.data[uid] = newDeal;

        await this.saveDeals();

        return expected(newDeal);
    }

    async acceptDeal(dealUid: string) : Promise<Expected<FullDeal>> {
        let deal = this.data[dealUid];

        if (deal === undefined) {
            return unexpected(`No deal of id ${dealUid}`);
        }

        deal.state = "accepted";
        deal.startDate = Math.floor(Date.now() / 1000);

        await this.saveDeals();

        return expected(deal);
    }

    async redeemDeal(dealUid: string) : Promise<Expected<FullDeal>> {
        let deal = this.data[dealUid];

        if (deal === undefined) {
            return unexpected(`No deal of id '${dealUid}' for user ${this.user.uid} (${this.user.username})`);
        }

        if (deal.state != "accepted") {
            return unexpected(`Deal of id ${dealUid} cannot be redeemed before being accepted !`);
        }

        let now = Math.floor(Date.now() / 1000);
        let remaining = deal.totalWaitTime - (now - (deal.startDate ?? 0));     // No start date => ok to redeem
        if (remaining > 0) {
            return unexpected(`Deal of id '${dealUid}' is not ready yet (${remaining} seconds remaining)`);
        }

        deal.state = "redeemed";
        await this.saveDeals();

        return expected(deal);
    }

    async removeDeal(dealUid: string) : Promise<Expected<FullDeal>> {
        let deal = this.data[dealUid];

        if (deal === undefined) {
            return unexpected(`No deal of id '${dealUid}' for user ${this.user.uid} (${this.user.username})`);
        }

        delete this.data[dealUid];

        await this.saveDeals();

        return expected(deal);
    }
}