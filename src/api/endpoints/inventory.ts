import type express from "express";
import { check } from "express-validator";

import { execValidationMiddleware, loggedUserMiddleware } from "./middleware";
import { DataSingleton } from "../data/data";

import "../common"


function addItemToInventoryRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("??");
    }

    let expItem = DataSingleton.getInstance().addItemToInventory(req.session.userUid, req.body.type, req.body.id)

    if (expItem.has_value()) {
        res.status(200).json(expItem.value());
    } else {
        res.status(400).json({errors: [expItem.error()]});  // TODO : errors in the same format as "check"
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