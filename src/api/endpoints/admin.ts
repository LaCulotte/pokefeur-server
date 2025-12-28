import express from "express"
import { DataModel } from "../model/DataModel";
import { adminUserMiddleware } from "./middleware";

// TODO : properly
function getAllUsers(req: express.Request, res: express.Response) {
    // res.json(DataModel.getInstance().users);
}

export function setupAdminEndpoints(app: express.Express) {
    // app.get("/api/getAllUsers", 
    //     adminUserMiddleware,
    //     getAllUsers
    // );
}