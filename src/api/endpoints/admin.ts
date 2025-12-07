import express from "express"
import { DataSingleton } from "../data/data";
import { adminUserMiddleware } from "./middleware";

function getAllUsers(req: express.Request, res: express.Response) {
    res.json(DataSingleton.getInstance().users);
}

export function setupAdminEndpoints(app: express.Express) {
    app.get("/api/getAllUsers", 
        adminUserMiddleware,
        getAllUsers
    );
}