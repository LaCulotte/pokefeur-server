import type { CardItem, InventoryItem, ItemType, FullUser, User, Payment, TradeProposal } from "@/api/model/interfaces";
import type { Type } from "../../../common/constants";
import type { AcceptDealSummary, RedeemDealSummary } from "@/api/controller/interfaces.dealership";
import { expected, unexpected, type Expected } from "../../../common/utils";

const defaultUserData: FullUser = {
    uid: "",
    username: "",
    type: "guest",

    inventory: {
        items: {},
        inTradeItems: {},
        energies: {}
    },
    deals: {},
    trades: {
        proposals: {}
    }
};

export class UserData {
    data: FullUser = defaultUserData;

    lastAuthenticated: number = -1;
    isAuthenticatedFlag: boolean = false;

    // TODO : not that
    loadPromise: Promise<void> | null = null;

    launchLoad(): Promise<void> {
        this.loadPromise = this.load();
        return this.loadPromise;
    }

    private async load() {
        if (!(await this.isAuthenticated())) {
            throw new Error("User is not authenticated");
        }
        
        this.data = (await fetch("/api/getFullUser")
            .then((res) => res.json()))["user"];
    }

    async login(username: string) {
        return fetch(`/api/login`, {
                method: "POST",
                body: JSON.stringify({ username: username }),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        )
        .then(async (res) => {
            if (res.status == 200) {
                this.lastAuthenticated = Date.now();
                this.isAuthenticatedFlag = true;
                await this.launchLoad();
            } else if (res.status == 400) {
                return res.json().then((data) => {
                    throw new Error(JSON.stringify(data.errors));
                });
            } else {
                return res.json().then((data) => {
                    throw new Error(data.message);
                });
            }
        })
        .catch((err) => {
            throw new Error(`On login : ${err}`);
        });
    }

    async logout() {
        return fetch(`/api/logout`, {
                method: "POST",
                // body: JSON.stringify({ username: username.value }),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        )
        .then((res) => {
            if (res.status == 200) {
                this.isAuthenticatedFlag = false;
                this.data = defaultUserData;
            } else if (res.status == 400) {
                return res.json().then((data) => {
                    throw new Error(data.errors);
                });
            } else {
                return res.json().then((data) => {
                    throw new Error(data.message);
                });
            }
        })
        .catch((err) => {
            throw new Error(`Error on logout : ${err}`);
        });
    }

    async isAuthenticated(): Promise<boolean> {
        if (this.isAuthenticatedFlag && Date.now() - this.lastAuthenticated < 5 * 60 * 1000) { // 5 minutes
            return true;
        }
    
        return fetch("/api/getUser", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })
        .then((res) => res.json())
        .then((data: {user: User}) => {
            this.isAuthenticatedFlag = !!data.user;
            if (this.isAuthenticatedFlag) {
                this.lastAuthenticated = Date.now();
            }

            return !!data.user;
        })
        .catch(err => {
            console.error("Error fetching user data:", err);
            this.isAuthenticatedFlag = false;
            this.lastAuthenticated = 0;
            return false;
        });
    }

    changeDescription(newDescription: string | undefined) {
        if (newDescription === undefined) {
            return;
        }

        fetch("/api/changeDescription",
            {
                method: "POST",
                body: JSON.stringify({newDescription}),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        ).then((res) => {
            if (res.status == 200) {
                this.data.description = newDescription;
            } else if (res.status == 400) {
                return res.json().then((err) => { throw JSON.stringify(err["errors"]); });
            } else if (res.status == 401) {
                return res.json().then((err) => { throw err["message"]; });
            }
        }).catch((err) => {
            console.error(`Cannot update description : ${err}`);
        });
    }

    addItem(type: ItemType, id: string) {
        fetch("/api/addItemToInventory",
            {
                method: "POST",
                body: JSON.stringify({type, id}),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        ).then((res) => {
            if (res.status == 200) {
                return res.json();
            } else if (res.status == 400) {
                return res.json().then((err) => { throw JSON.stringify(err["errors"]); });
            } else if (res.status == 401) {
                return res.json().then((err) => { throw err["message"]; });
            }
        }).then((item: InventoryItem) => {
            this.data.inventory.items[item.uid] = item;
        }).catch((err) => {
            console.error(`Cannot add card : ${err}`);
        });
    }

    removeItem(itemUid: string) {
        fetch("/api/removeItemFromInventory",
            {
                method: "POST",
                body: JSON.stringify({itemUid}),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        ).then((res) => {
            if (res.status == 200) {
                return;
            } else if (res.status == 400) {
                return res.json().then((err) => { throw JSON.stringify(err["errors"]); });
            } else if (res.status == 401) {
                return res.json().then((err) => { throw err["message"]; });
            }
        }).then(() => {
            delete this.data.inventory.items[itemUid];
        }).catch((err) => {
            console.error(`Cannot add card : ${err}`);
        });
    }

    openBooster(itemUid: string) {
        if (!(itemUid in this.data.inventory.items)) {
            return;
        }

        fetch("/api/openBooster",
            {
                method: "POST",
                body: JSON.stringify({itemUid}),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        ).then((res) => {
            if (res.status == 200) {
                return res.json();
            } else if (res.status == 400) {
                return res.json().then((err) => { throw JSON.stringify(err["errors"]); });
            } else if (res.status == 401) {
                return res.json().then((err) => { throw err["message"]; });
            }
        }).then((data: Array<CardItem>) => {
            delete this.data.inventory.items[itemUid];

            for (const card of data.values()) {
                this.data.inventory.items[card.uid] = card;
            }
        }).catch((err) => {
            console.error(`Cannot open booster : ${err}`);
        });
    }

    recycleCard(itemUid: string) {
        if (!(itemUid in this.data.inventory.items)) {
            return;
        }

        fetch("/api/recycleCards",
            {
                method: "POST",
                body: JSON.stringify({cardUids: [itemUid]}),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        ).then((res) => {
            if (res.status == 200) {
                return res.json();
            } else if (res.status == 400) {
                return res.json().then((err) => { throw JSON.stringify(err["errors"]); });
            } else if (res.status == 401) {
                return res.json().then((err) => { throw err["message"]; });
            }
        }).then((data: Array<Type>) => {
            delete this.data.inventory.items[itemUid];

            for (const energy of data.values()) {
                if (this.data.inventory.energies[energy] === undefined) {
                    this.data.inventory.energies[energy] = 0;
                }

                this.data.inventory.energies[energy] += 1;
            }
        }).catch((err) => {
            console.error(`Cannot recycle card : ${err}`);
        });
    }

    acceptDeal(dealUid: string, payment: Payment) {
        if (!(dealUid in this.data.deals)) {
            console.log("Why are you running ?");
            return;
        }

        fetch("/api/deals/acceptDeal",
            {
                method: "POST",
                body: JSON.stringify({dealUid, payment}),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        ).then((res) => {
            if (res.status == 200) {
                return res.json();
            } else if (res.status == 400) {
                return res.json().then((err) => { throw JSON.stringify(err["errors"]); });
            } else if (res.status == 401) {
                return res.json().then((err) => { throw err["message"]; });
            }
        }).then((data: AcceptDealSummary) => {
            this.data.deals[dealUid] = data.acceptedDeal;

            for (const [energyStr, count] of Object.entries(data.paidCost.energies)) {
                const energyType = parseInt(energyStr) as Type;
                if (this.data.inventory.energies[energyType] !== undefined) {
                    this.data.inventory.energies[energyType] -= count;
                }
            }

            for (const paidItem of data.paidCost.items) {
                delete this.data.inventory.items[paidItem.itemUid];
            }
        }).catch((err) => {
            console.error(`Cannot accept deal : ${err}`);
        });
    }

    redeemDeal(dealUid: string): Promise<Expected<RedeemDealSummary>> {
        if (!(dealUid in this.data.deals)) {
            return (async () => unexpected("Why are you running ?", true))();
        }

        return fetch("/api/deals/redeemDeal",
            {
                method: "POST",
                body: JSON.stringify({dealUid}),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        ).then((res) => {
            if (res.status == 200) {
                return res.json();
            } else if (res.status == 400) {
                return res.json().then((err) => { throw JSON.stringify(err["errors"]); });
            } else if (res.status == 401) {
                return res.json().then((err) => { throw err["message"]; });
            }
        }).then((data: RedeemDealSummary) => {
            this.data.deals[data.redeemedDeal.uid] = data.redeemedDeal;
            this.data.inventory.items[data.newItem.uid] = data.newItem;

            return expected(data);
        }).catch((err) => {
            return unexpected(`Cannot redeem deal : ${err}`, true);
        });
    }

    createTradeProposal(toUserUid: string, offeredItemUids: string[], requestedItemUids: string[]): Promise<Expected<TradeProposal>> {
        return fetch("/api/createTradeProposal",
            {
                method: "POST",
                body: JSON.stringify({
                    toUserUid,
                    offeredItemUids,
                    requestedItemUids
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        ).then((res) => {
            if (res.status == 200) {
                return res.json();
            } else if (res.status == 400) {
                return res.json().then((err) => { throw JSON.stringify(err["errors"]); });
            } else if (res.status == 401) {
                return res.json().then((err) => { throw err["message"]; });
            }
        }).then((data: TradeProposal) => {
            for (const itemUid of offeredItemUids) {
                if (this.data.inventory.items[itemUid]) {
                    this.data.inventory.inTradeItems[itemUid] = this.data.inventory.items[itemUid]!;
                    delete this.data.inventory.items[itemUid];
                }
            }

            this.data.trades.proposals[data.uid] = data;

            return expected(data);
        }).catch((err) => {
            return unexpected(`Cannot make trade proposal : ${err}`, true);
        });
    }

    refuseTradeProposal(proposalUid: string): Promise<Expected<TradeProposal>> {
        if (!(proposalUid in this.data.trades.proposals)) {
            return (async () => unexpected("Why are you running ?", true))();
        }

        return fetch("/api/refuseTradeProposal",
            {
                method: "POST",
                body: JSON.stringify({ proposalUid }),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        ).then((res) => {
            if (res.status == 200) {
                return res.json();
            } else if (res.status == 400) {
                return res.json().then((err) => { throw JSON.stringify(err["errors"]); });
            } else if (res.status == 401) {
                return res.json().then((err) => { throw err["message"]; });
            }
        }).then((data: TradeProposal) => {
            const items = this.data.uid == data.from.uid ? data.from.items : data.to.items;
            for (const item of items) {
                if (this.data.inventory.inTradeItems[item.uid]) {
                    this.data.inventory.items[item.uid] = this.data.inventory.inTradeItems[item.uid]!;
                    delete this.data.inventory.inTradeItems[item.uid];
                }
            }

            this.data.trades.proposals[data.uid] = data;

            return expected(data);
        }).catch((err) => {
            return unexpected(`Cannot refuse trade proposal : ${err}`, true);
        });
    }

    acceptTradeProposal(proposalUid: string): Promise<Expected<TradeProposal>> {
        if (!(proposalUid in this.data.trades.proposals)) {
            return (async () => unexpected("Why are you running ?", true))();
        }

        return fetch("/api/acceptTradeProposal",
            {
                method: "POST",
                body: JSON.stringify({ proposalUid }),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        ).then((res) => {
            if (res.status == 200) {
                return res.json();
            } else if (res.status == 400) {
                return res.json().then((err) => { throw JSON.stringify(err["errors"]); });
            } else if (res.status == 401) {
                return res.json().then((err) => { throw err["message"]; });
            }
        }).then((data: TradeProposal) => {
            const items = this.data.uid == data.from.uid ? data.from.items : data.to.items;
            for (const item of items) {
                delete this.data.inventory.inTradeItems[item.uid];
            }

            this.data.trades.proposals[data.uid] = data;

            return expected(data);
        }).catch((err) => {
            return unexpected(`Cannot refuse trade proposal : ${err}`, true);
        });
    }

    completeTradeProposal(proposalUid: string): Promise<Expected<TradeProposal>> {
        if (!(proposalUid in this.data.trades.proposals)) {
            return (async () => unexpected("Why are you running ?", true))();
        }

        return fetch("/api/completeTradeProposal",
            {
                method: "POST",
                body: JSON.stringify({ proposalUid }),
                headers: {
                    "Content-Type": "application/json",
                }
            }
        ).then((res) => {
            if (res.status == 200) {
                return res.json();
            } else if (res.status == 400) {
                return res.json().then((err) => { throw JSON.stringify(err["errors"]); });
            } else if (res.status == 401) {
                return res.json().then((err) => { throw err["message"]; });
            }
        }).then((data: TradeProposal) => {
            const items = this.data.uid == data.from.uid ? data.to.items : data.from.items;
            for (const item of items) {
                this.data.inventory.items[item.uid] = item;
            }

            this.data.trades.proposals[data.uid] = data;

            return expected(data);
        }).catch((err) => {
            return unexpected(`Cannot refuse trade proposal : ${err}`, true);
        });
    }
}