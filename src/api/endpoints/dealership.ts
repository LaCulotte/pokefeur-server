import type express from "express";
import { check, checkSchema } from "express-validator";

import { execValidationMiddleware, loggedUserMiddleware } from "./middleware";
import { DataModel } from "../model/DataModel";

import "../common"
import { acceptDeal, redeemDeal } from "../controller/dealership";

import { Type, TypeMap } from "../../common/constants";

export async function acceptDealRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("No userUid on add deal request ?");
    }

    let expAddDeal = await acceptDeal(req.session.userUid, req.body.dealUid, req.body.payment);

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
    app.post("/api/deals/acceptDeal",
        loggedUserMiddleware,
        checkSchema({
            dealUid: { isString: true },
            payment: { isObject: true },
            "payment.energies": {
                isObject: true,
                custom: {
                    options: (value) => {
                        for (const key in value) {
                            if (!(parseInt(key) in Object.values(Type))) {
                                throw new Error(`Invalid energy type: ${key}`);
                            }
                        }

                        return true;
                    }
                }
            },
            "payment.energies.*": { isInt: true },
            "payment.items": { isArray: true },
            "payment.items.*": { isString: true },
        }),
        execValidationMiddleware,
        acceptDealRequest
    );

    app.post("/api/deals/redeemDeal",
        loggedUserMiddleware,
        check("dealUid").isString(),
        execValidationMiddleware,
        redeemDealRequest
    );
}