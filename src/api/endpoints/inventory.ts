import type express from "express";
import { check } from "express-validator";

import { execValidationMiddleware, loggedUserMiddleware } from "./middleware";
import { DataModel } from "../model/DataModel";

import "../common"
import { openBooster } from "../controller/booster";


async function addItemToInventoryRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("No userUid on add item request ?");
    }

    let user = DataModel.getUser(req.session.userUid);
    if (user === null) {
        res.status(400).json({errors: [`Unknown user ${user}`]});
        return;
    }
    
    let expItem = await user.inventory.addItemToInventory(req.body.type, req.body.id)

    if (expItem.has_value()) {
        res.status(200).json(expItem.value());
    } else {
        res.status(400).json({errors: [expItem.error()]});  // TODO : errors in the same format as "check"
    }
}

async function removeItemFromInventoryRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("No userUid on remove item request ?");
    }

    let user = DataModel.getUser(req.session.userUid);
    if (user === null) {
        res.status(400).json({errors: [`Unknown user ${user}`]});
        return;
    }

    let expItem = await user.inventory.removeItemFromInventory(req.body.itemUid);

    if (expItem.has_value()) {
        res.status(200).json(expItem.value());
    } else {
        res.status(400).json({errors: [expItem.error()]});  // TODO : errors in the same format as "check"
    }
}

async function openBoosterRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("No userUid on remove item request ?");
    }

    let expOpenedCards = await openBooster(req.session.userUid, req.body.itemUid);

    if (expOpenedCards.has_value()) {
        res.status(200).json(expOpenedCards.value());
    } else {
        res.status(400).json({errors: [expOpenedCards.error()]});  // TODO : errors in the same format as "check"
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

    app.post("/api/removeItemFromInventory",
        loggedUserMiddleware,
        check("itemUid").isString(),
        execValidationMiddleware,
        removeItemFromInventoryRequest
    );

    app.post("/api/openBooster",
        loggedUserMiddleware,
        check("itemUid").isString(),
        execValidationMiddleware,
        openBoosterRequest
    );
}