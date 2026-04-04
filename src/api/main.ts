import express from "express";

import { StaticDataSingleton } from "./staticData/loader";
import { setupLoginEnpoints } from "./endpoints/login";

import session from "express-session"
import fileStore from "session-file-store";
const FileStore = fileStore(session);

import "./common"
import { DataModel } from "./model/DataModel";
import { initUserDeals } from "./controller/dealership";

import { setupInventoryEndpoints } from "./endpoints/inventory";
import { setupAdminEndpoints } from "./endpoints/admin";
import { setupDealershipEndpoints } from "./endpoints/dealership";
import { setupTradeProposalEndpoints } from "./endpoints/tradeProposal";

import { GENERATED_DIR } from "../common/constants";
import path from "path"

const a = Date.now();
await StaticDataSingleton.load();
await DataModel.load();
console.log(`Loaded data in ${Date.now() - a} ms`)

// TODO : more generic ?
for (const user of Object.values(DataModel.getInstance().users)) {
    initUserDeals(user);    // TODO : Do it on create as well !!
}
console.log(`Loaded controllers in ${Date.now() - a} ms`)

const app = express();
app.use(express.json())

app.get("/api/static/pokemons", (req, res) => {
    res.sendFile(path.join(path.resolve(), GENERATED_DIR, "pokemons.json"));
});

app.get("/api/static/keys/*path", (req, res) => {
    //@ts-ignore
    const pathArray: string[] = req.params.path;

    if (!pathArray || pathArray.length === 0) {
        res.status(400).json({ error: "No path provided" });
        return;
    }

    const isLang = pathArray[0] == "lang";
    let currData: any = isLang ? StaticDataSingleton.getInstance().staticLangDataStore : StaticDataSingleton.getInstance().staticData;

    for (const i of pathArray.slice(1)) {
        if (currData[i] === undefined) {
            res.status(404).json({ error: `Path component '${i}' not found` });
            return;
        }

        currData = currData[i];
    }
    
    res.json(Object.keys(currData));
});

// Endpoint that loops over any number of path component
app.get("/api/static/*path", (req, res) => {
    //@ts-ignore
    const pathArray: string[] = req.params.path;

    if (!pathArray || pathArray.length === 0) {
        res.status(400).json({ error: "No path provided" });
        return;
    }

    const isLang = pathArray[0] == "lang";
    let currData: any = isLang ? StaticDataSingleton.getInstance().staticLangDataStore : StaticDataSingleton.getInstance().staticData;

    for (const i of pathArray.slice(1)) {
        if (currData[i] === undefined) {
            res.status(404).json({ error: `Path component '${i}' not found` });
            return;
        }

        currData = currData[i];
    }
    
    res.json(currData);
});

app.use(session({
    secret: 'blablabla',
    resave: false,
    saveUninitialized: true,
    store: new FileStore({
        path: "./data/sessions",
        ttl: 999999999,
    })
}));

setupLoginEnpoints(app);
setupInventoryEndpoints(app);
setupAdminEndpoints(app);
setupDealershipEndpoints(app);
setupTradeProposalEndpoints(app);

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});