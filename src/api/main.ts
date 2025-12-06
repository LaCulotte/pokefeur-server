import express from "express";

import { StaticDataSingleton } from "./staticData/loader";
import { setupLoginEnpoints } from "./endpoints/login";

import session from "express-session"
import fileStore from "session-file-store";
let FileStore = fileStore(session);

import "./common"
import { DataSingleton } from "./data/data";
import { setupInventoryEndpoints } from "./endpoints/inventory";

let a = Date.now();
// console.log(a = Date.now())
await StaticDataSingleton.load();
await DataSingleton.load();
console.log(`Loaded static data in ${Date.now() - a} ms`)


const app = express();
app.use(express.json())

app.get("/api/static/keys/*path", (req, res) => {
    //@ts-ignore
    let pathArray: string[] = req.params.path;

    if (!pathArray || pathArray.length === 0) {
        res.status(400).json({ error: "No path provided" });
        return;
    }

    let isLang = pathArray[0] == "lang";
    let currData: any = isLang ? StaticDataSingleton.getInstance().staticLangData : StaticDataSingleton.getInstance().staticData;

    for (let i of pathArray.slice(1)) {
        if (currData[i] === undefined) {
            res.status(404).json({ error: `Path component '${i}' not found` });
            return;
        }

        currData = currData[i];
    }
    
    res.json(Object.keys(currData));
});

// Endpoint that loops over any number of path component
app.get("/api/static/*path", (req, res) => {
    //@ts-ignore
    let pathArray: string[] = req.params.path;

    if (!pathArray || pathArray.length === 0) {
        res.status(400).json({ error: "No path provided" });
        return;
    }

    let isLang = pathArray[0] == "lang";
    let currData: any = isLang ? StaticDataSingleton.getInstance().staticLangData : StaticDataSingleton.getInstance().staticData;

    for (let i of pathArray.slice(1)) {
        if (currData[i] === undefined) {
            res.status(404).json({ error: `Path component '${i}' not found` });
            return;
        }

        currData = currData[i];
    }
    
    res.json(currData);
});

app.use(session({
    secret: 'blablabla',
    resave: false,
    saveUninitialized: true,
    store: new FileStore({
        path: "./data/sessions",
        ttl: 999999999,
    })
}));

setupLoginEnpoints(app);
setupInventoryEndpoints(app);



// app.get("/api/test/", (req, res) => {
//     console.log(req.session);

//     if (req.session.user === undefined) {
//         console.log("No user in session");
//         res.sendStatus(401);
//         return;
//     }

//     res.json({ message: "API is working!" });
// });

// app.get("/api/getUser/", (req, res) => {    
//     if (req.session.user === undefined) {
//         console.log("No user in session");
//         res.json({ user: null });
//         return;
//     }
    
//     res.json({ username: req.session.user });
// });

// app.post("/api/login/:username/", (req, res) => {
//     console.log("Login attempt");
//     console.log(req.params);

//     const { username } = req.params;

//     console.log("Logging in user:", username);

//     // In a real application, you would verify the username and password here
//     // For this example, we'll just create a user object with the provided username

//     // const user = {
//     //     id: '1',
//     //     username: username,
//     //     type: 'user' as const
//     // };

//     // Store user information in session
//     req.session.user = username;

//     res.json({ message: "Login successful", username: username });
// });

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});