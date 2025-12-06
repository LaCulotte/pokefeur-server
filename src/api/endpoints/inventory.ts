import type express from "express";
import { check, matchedData, validationResult } from "express-validator";

import { execValidationMiddleware, loggedUserMiddleware } from "./middleware";
import { DataSingleton } from "../data/data";

import "../common"
import type { User, UserWithInventory } from "../data/interfaces";


function addItemToInventoryRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("??");
    }

    let err = DataSingleton.getInstance().addItemToInventory(req.session.userUid, req.body.type, req.body.id)

    if (err === undefined) {
        res.sendStatus(200);
    } else {
        res.status(400).json({errors: [err]});
    }
}

export function setupInventoryEndpoints(app: express.Express) {
    app.post("/api/addItemToInventory", 
        loggedUserMiddleware,
        check("type").isString().isIn(["card", "booster"]),
        check("id").isString(),
        execValidationMiddleware,
        addItemToInventoryRequest
    );
}