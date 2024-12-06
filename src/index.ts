import express, { Request, Response } from "express";
import botRouter from "./bot-router";
import cron from "node-cron";
import { fetchLatest } from "./exploit";

fetchLatest()
const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/bot", botRouter)

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript with Express!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
