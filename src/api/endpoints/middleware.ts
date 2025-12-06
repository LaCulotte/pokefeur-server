import type express from "express"
import { validationResult } from "express-validator";

import { DataSingleton } from "../data/data";

export function loggedUserMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.session.userUid === undefined) {
        res.status(401).json({ message: "Not logged in" });
        return;
    }

    next();
}

export function adminUserMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.session.userUid === undefined) {
        res.status(401).json({ message: "Not logged in" });
        return;
    }

    const user = DataSingleton.getInstance().getUser(req.session.userUid);
    if (user === null || user.type !== "admin") {
        res.status(403).json({ message: "Not an admin" });
        return;
    }

    next();
}

export function execValidationMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(400).json({errors: result.array()});
        return;
    }

    next();
}