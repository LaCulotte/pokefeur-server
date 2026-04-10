import type express from "express";
import { body, check, matchedData, validationResult } from "express-validator";

import { execValidationMiddleware, loggedUserMiddleware } from "./middleware";
import { DataModel } from "../model/DataModel";
import { UserModel } from "../model/UserModel";
import { initUserDeals } from "../controller/dealership";

import "../common";
import type { FullUser, PublicUser, UserSearchResult } from "../model/interfaces";

function login(req: express.Request, res: express.Response) {
    if (req.session.userUid !== undefined) {
        res.status(401).json({message: "Already logged in !"});
        return;
    }

    const username: string = req.body.username;

    let user: UserModel | undefined = DataModel.getUserByName(username);
    if (user === undefined) {
        user = DataModel.getInstance().createUser(username, "admin");
        initUserDeals(user);
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
        res.json({ user: undefined });
        return;
    }

    const user: UserModel | undefined = DataModel.getUser(req.session.userUid);
    if (user === undefined) {
        req.session.userUid = undefined;
    }

    res.json({ user: user?.data });
}

function getFullUser(req: express.Request, res: express.Response) {
    if (req.session.userUid === undefined) {
        throw new Error("Logged state not validated !");
    }

    const user: UserModel | undefined = DataModel.getUser(req.session.userUid);
    if (user === undefined) {
        req.session.userUid = undefined;
        res.json({ user: undefined });
        return;
    }

    // TODO : function UserModel.getFullData ?
    const ret: FullUser = {
        ...user.data,
        inventory: user.inventory.data,
        deals: user.deals.getReducedData(),
        trades: user.trades.data
    };
    res.json({ user: ret });
}

function searchUsers(req: express.Request, res: express.Response) {
    if (req.session.userUid === undefined) {
        throw new Error("Logged state not validated !");
    }
    
    const usernameQuery: string = req.query.usernameQuery as string;
    const ret = DataModel.getInstance().searchUsers(usernameQuery);
    res.json(ret);
}

function changeDescription(req: express.Request, res: express.Response) {
    if (req.session.userUid === undefined) {
        throw new Error("Logged state not validated !");
    }
    
    const success = DataModel.getInstance().changeDescription(req.session.userUid, req.body.newDescription);
    if (!success) {
        res.status(500).json({message: "Failed to change description"});
        return;
    }

    res.json({message: "Description changed successfully"});
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

    app.get("/api/getFullUser", 
        loggedUserMiddleware,
        getFullUser
    );

    app.get("/api/searchUsers", 
        loggedUserMiddleware,
        check("usernameQuery").isString().notEmpty(),
        searchUsers
    );

    app.post("/api/changeDescription",
        loggedUserMiddleware,
        check("newDescription").isString().notEmpty(),
        changeDescription
    );

    // app.get("/api/queryUser",
    //     check("uid").isString().notEmpty(),
    //     execValidationMiddleware,
    //     queryUser
    // );
}