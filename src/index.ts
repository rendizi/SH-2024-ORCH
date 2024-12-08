import express, { Request, Response } from "express";
import botRouter from "./bot-router";
import cron from "node-cron";
import { de, fetchLatest } from "./exploit";
import userRouter from "./user-router";
import cors from "cors"

fetchLatest()
cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running fetchLatest at midnight...");
      await fetchLatest();
      console.log("fetchLatest completed successfully.");
    } catch (error) {
      console.error("Error running fetchLatest:", error);
    }
  });
const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors())

app.use("/bot", botRouter)
app.use("/user", userRouter)

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript with Express!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
