import express, { Request, Response } from "express";
import botRouter from "./bot-router";
import cron from "node-cron";
import { de, fetchLatest } from "./exploit";
import userRouter from "./user-router";

// fetchLatest()
const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/bot", botRouter)
app.use("/user", userRouter)

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript with Express!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
