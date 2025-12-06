import type express from "express";
import { body, check, matchedData, validationResult } from "express-validator";

import { execValidationMiddleware, loggedUserMiddleware } from "./middleware";
import { DataSingleton } from "../data/data";

import "../common"
import type { User, UserWithInventory } from "../data/interfaces";

function login(req: express.Request, res: express.Response) {
    if (req.session.userUid !== undefined) {
        res.status(401).json({message: "Already logged in !"});
        return;
    }

    let username: string = req.body.username;

    let user: User | null = DataSingleton.getInstance().getUserByName(username);
    if (user === null) {
        user = DataSingleton.getInstance().createUser(username, "admin");
    }

    req.session.userUid = user.uid;
    res.json({ user });
}

function logout(req: express.Request, res: express.Response) {
    req.session.userUid = undefined;
    res.sendStatus(200);
}

function getUserRequest(req: express.Request, res: express.Response) {
    if (req.session.userUid === undefined) {
        res.json({ user: null });
        return;
    }

    const user: User | null = DataSingleton.getInstance().getUser(req.session.userUid);
    res.json({ user: user });
}

function getUserWithInventory(req: express.Request, res: express.Response) {
    if (req.session.userUid === undefined) {
        throw new Error("Logged state not validated !");
    }

    const user: User | null = DataSingleton.getInstance().getUser(req.session.userUid);

    if (user === null) {
        res.json({ user: null });
        return;
    }

    const userWithInventory = user as UserWithInventory;
    userWithInventory.inventory = DataSingleton.getInstance().getUserInventory(user.uid) ?? {};

    res.json({ user: userWithInventory });
}


// TODO : use generic class "endpoint" that handles path, middleware and handler registration
//        the different endpoints derive from this class and implement their specificities
export function setupLoginEnpoints(app: express.Express) {
    app.post("/api/login",
        check("username").isString().notEmpty(),
        execValidationMiddleware,
        login
    );

    app.post("/api/logout", 
        logout
    );

    app.get("/api/getUser", 
        getUserRequest
    );

    app.get("/api/getUserWithInventory", 
        loggedUserMiddleware,
        getUserWithInventory
    );
}