import type { InventoryItem, ItemType, UserWithInventory } from "@/api/data/interfaces";

export class UserData {
    data: UserWithInventory = {
        uid: "",
        username: "",
        type: "guest",

        inventory: {}
    };

    async load() {
        this.data = (await fetch("/api/getUserWithInventory")
            .then((res) => res.json()))["user"];

        console.log(this.data);
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
                return res.json()
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
}