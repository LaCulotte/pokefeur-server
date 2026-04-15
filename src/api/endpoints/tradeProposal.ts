import type express from "express";
import { body, check, matchedData, validationResult } from "express-validator";

import { execValidationMiddleware, loggedUserMiddleware } from "./middleware";
import { DataModel } from "../model/DataModel";
import { acceptTradeProposal, completeTradeProposal, makeTradeProposal, refuseTradeProposal } from "../controller/tradeProposal";

async function getTradeProposalsRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("No userUid on add item request ?");
    }

    const user = DataModel.getUser(req.session.userUid);
    if (user === undefined) {
        res.status(400).json({errors: [`Unknown user ${user}`]});
        return;
    }

    return res.json(user.trades.data.proposals);
}

async function createTradeProposalRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("No userUid on add item request ?");
    }
    
    const expProposal = await makeTradeProposal(req.session.userUid, req.body.toUserUid, req.body.offeredItemUids, req.body.requestedItemUids);
    
    if (expProposal.has_value) {
        res.status(200).json(expProposal.value());
    } else {
        res.status(400).json({errors: [expProposal.error()]});
    }
}

async function acceptTradeProposalRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("No userUid on add item request ?");
    }
    
    const expAccepted = await acceptTradeProposal(req.session.userUid, req.body.proposalUid);

    if (expAccepted.has_value) {
        res.status(200).json(expAccepted.value());
    } else {
        res.status(400).json({errors: [expAccepted.error()]});
    }
}

async function refuseTradeProposalRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("No userUid on add item request ?");
    }
    
    const expRefused = await refuseTradeProposal(req.session.userUid, req.body.proposalUid);

    if (expRefused.has_value) {
        res.status(200).json(expRefused.value());
    } else {
        res.status(400).json({errors: [expRefused.error()]});
    }
}

async function completeTradeProposalRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid == undefined) {
        throw new Error("No userUid on add item request ?");
    }
    
    const expCompleted = await completeTradeProposal(req.session.userUid, req.body.proposalUid);

    if (expCompleted.has_value) {
        res.status(200).json(expCompleted.value());
    } else {
        res.status(400).json({errors: [expCompleted.error()]});
    }
}

export function setupTradeProposalEndpoints(app: express.Express) {
    app.get("/api/getTradeProposals",
        loggedUserMiddleware,
        getTradeProposalsRequest
    );

    app.post("/api/createTradeProposal",
        loggedUserMiddleware,
        check("toUserUid").isString(),
        check("offeredItemUids").isArray(),
        check("offeredItemUids.*").isString(),
        check("requestedItemUids").isArray(),
        check("requestedItemUids.*").isString(),
        execValidationMiddleware,
        createTradeProposalRequest
    );

    app.post("/api/acceptTradeProposal",
        loggedUserMiddleware,
        check("proposalUid").isString(),
        execValidationMiddleware,
        acceptTradeProposalRequest
    );

    app.post("/api/refuseTradeProposal",
        loggedUserMiddleware,
        check("proposalUid").isString(),
        execValidationMiddleware,
        refuseTradeProposalRequest
    );

    app.post("/api/completeTradeProposal",
        loggedUserMiddleware,
        check("proposalUid").isString(),
        execValidationMiddleware,
        completeTradeProposalRequest
    );

    // TODO : auto-refuse un-acceptable trade proposals
}
