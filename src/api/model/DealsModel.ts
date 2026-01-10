import fs from "fs/promises"
import { v4 as uuidv4 } from "uuid"

import type { ItemType, Deal, User, FullDeal } from "./interfaces"
import { StaticDataSingleton } from "../staticData/loader";
import { Expected, expected, unexpected } from "../../common/utils";

export class DealsModel {
    user: User
    data: Record<string, FullDeal>

    constructor(user: User) {
        this.user = user;
        this.data = {};
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
        } catch (e) {
            console.warn(`Could not load deals for user ${this.user.username} (uid: ${this.user.uid})`);

            this.data = {};
            this.saveDeals();
        }
    }

    async saveDeals() {
        // TODO : We probably should await previous calls to this function. Should no longer be a problem when using proper databases
        await fs.writeFile(`./data/deals/${this.user.uid}.json`, JSON.stringify(this.data ?? {}), "utf-8");
    }

    reduceDeal(deal: FullDeal) : Deal {
        return {
            uid: deal.uid,
            startDate: deal.startDate,
            totalWaitTime: deal.totalWaitTime
        }
    }

    getReducedData() : Record<string, Deal> {
        let ret: Record<string, Deal> = {};
        
        for (let [uid, deal] of Object.entries(this.data)) {
            ret[uid] = this.reduceDeal(deal);
        }

        return ret;
    }

    async addDeal(itemType: ItemType, itemId: string, totalWaitTime: number) : Promise<Expected<Deal>> {
        if (Object.keys(this.data).length > 0) {
            return unexpected(`${this.user.uid} (${this.user.username}) already has the maximum number of deals`);
        }

        let uid = uuidv4();

        while (uid in this.data) {
            uid = uuidv4();
        }
        
        let newDeal: FullDeal = {
            uid,
            startDate: Math.floor(Date.now() / 1000),
            totalWaitTime,
            itemType,
            itemId
        }

        this.data[uid] = newDeal;

        await this.saveDeals();

        return expected(this.reduceDeal(newDeal));
    }

    async redeemDeal(uid: string) : Promise<Expected<FullDeal>> {
        let deal = this.data[uid];

        if (deal === undefined) {
            return unexpected(`No deal of id '${uid}' for user ${this.user.uid} (${this.user.username})`);
        }

        let now = Math.floor(Date.now() / 1000);
        let remaining = deal.totalWaitTime - (now - deal.startDate);
        if (remaining > 0) {
            return unexpected(`Deal of id '${uid}' is not ready yet (${remaining} seconds remaining)`);
        }

        delete this.data[uid];

        await this.saveDeals();

        return expected(deal);
    }
}