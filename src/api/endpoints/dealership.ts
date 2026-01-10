import type express from "express";
import { check } from "express-validator";

import { execValidationMiddleware, loggedUserMiddleware } from "./middleware";
import { DataModel } from "../model/DataModel";

import "../common"
import { addDeal, redeemDeal } from "../controller/dealership";

export async function addDealRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("No userUid on add deal request ?");
    }

    let expAddDeal = await addDeal(req.session.userUid, req.body.itemUidsToPay);

    if (expAddDeal.has_value()) {
        res.status(200).json(expAddDeal.value());
    } else {
        res.status(400).json({errors: [expAddDeal.error()]});  // TODO : errors in the same format as "check"
    }
}

export async function redeemDealRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("No userUid on add deal request ?");
    }

    let expRedeemDeal = await redeemDeal(req.session.userUid, req.body.dealUid);

    if (expRedeemDeal.has_value()) {
        res.status(200).json(expRedeemDeal.value());
    } else {
        res.status(400).json({errors: [expRedeemDeal.error()]});  // TODO : errors in the same format as "check"
    }
}


export function setupDealershipEndpoints(app: express.Express) {
    app.post("/api/deals/addDeal",
        loggedUserMiddleware,
        check("itemUidsToPay").isArray(),
        check("itemUidsToPay.*").isString(),
        execValidationMiddleware,
        addDealRequest
    );

    app.post("/api/deals/redeemDeal",
        loggedUserMiddleware,
        check("dealUid").isString(),
        execValidationMiddleware,
        redeemDealRequest
    );
}