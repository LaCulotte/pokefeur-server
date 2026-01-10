import type { CardItem, InventoryItem, ItemType, FullUser, User } from "@/api/model/interfaces";

export class UserData {
    data: FullUser = {
        uid: "",
        username: "",
        type: "guest",

        inventory: {},
        deals: {}
    };

    lastAuthenticated: number = -1;
    isAuthenticatedFlag: boolean = false;

    async load() {
        if (!(await this.isAuthenticated())) {
            throw new Error("User is not authenticated");
        }
        
        this.data = (await fetch("/api/getFullUser")
            .then((res) => res.json()))["user"];

        console.log(this.data);
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
                await this.load();
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
            this.data.inventory[item.uid] = item;
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
            delete this.data.inventory[itemUid];
        }).catch((err) => {
            console.error(`Cannot add card : ${err}`);
        });
    }

    openBooster(itemUid: string) {
        if (!(itemUid in this.data.inventory)) {
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
            delete this.data.inventory[itemUid];

            for (let card of data.values()) {
                this.data.inventory[card.uid] = card;
            }
        }).catch((err) => {
            console.error(`Cannot add card : ${err}`);
        });
    }
}