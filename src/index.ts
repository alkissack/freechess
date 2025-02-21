import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import apiRouter from "./api";

const app = express();

app.use(express.json());

app.use("/static",
    express.static("dist/public"),
    express.static("src/public")
);

app.use("/api", apiRouter);

app.get("/", async (req, res) => {
    res.sendFile(path.resolve("src/public/pages/report/index.html"));
});

app.get("/privacy", async (req, res) => {
    res.sendFile(path.resolve("src/public/pages/privacy/index.html"));
});

// https://github.com/WintrCat/freechess/pull/56/commits/53b41f91e6263fad4a7f76140e91f094607733b7
//if not port in env, set 5000
const port = process.env.PORT == undefined? 5000: process.env.PORT

app.listen(port, () => {
    console.log("Server running on :", port);
// app.listen(process.env.PORT, () => {
//     console.log("Server running.");
});
