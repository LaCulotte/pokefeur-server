import type express from "express";
import { body, check, matchedData, validationResult } from "express-validator";

import { execValidationMiddleware, loggedUserMiddleware } from "./middleware";
import { DataModel } from "../model/DataModel";
import { UserModel } from "../model/UserModel";

import "../common"
import type { User, FullUser } from "../model/interfaces";

function login(req: express.Request, res: express.Response) {
    if (req.session.userUid !== undefined) {
        res.status(401).json({message: "Already logged in !"});
        return;
    }

    let username: string = req.body.username;

    let user: UserModel | null = DataModel.getUserByName(username);
    if (user === null) {
        user = DataModel.getInstance().createUser(username, "admin");
    }

    req.session.userUid = user.data.uid;
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

    const user: UserModel | null = DataModel.getUser(req.session.userUid);
    if (user === null) {
        req.session.userUid = undefined;
        res.json({ user: null });
        return;
    }

    res.json({ user: user.data });
}

function getUserWithInventory(req: express.Request, res: express.Response) {
    if (req.session.userUid === undefined) {
        throw new Error("Logged state not validated !");
    }

    const user: UserModel | null = DataModel.getUser(req.session.userUid);
    if (user === null) {
        req.session.userUid = undefined;
        res.json({ user: null });
        return;
    }

    // TODO : function UserModel.getFullData ?
    let ret: FullUser = {
        ...structuredClone(user.data),
        inventory: structuredClone(user.inventory.data)
    };
    res.json({ user: ret });
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
        loggedUserMiddleware,
        getUserRequest
    );

    app.get("/api/getUserWithInventory", 
        loggedUserMiddleware,
        getUserWithInventory
    );
}