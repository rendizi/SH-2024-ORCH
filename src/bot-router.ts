import { Request, Response, Router } from "express";
import prisma from "./prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, authMiddleware } from "./middleware";
import { exec } from "child_process";

const botRouter = Router()

botRouter.post("/register", async (req: Request, res: Response) => {
    const { ip, secretKey } = req.body;

    if (!ip || !secretKey) {
        res.status(400).send({ error: "IP and secretKey are required" });
        return 
    }

    if (secretKey !== process.env.SECRET_KEY) {
        res.status(403).send({ error: "Invalid secretKey" });
        return 
    }

    const botInfo: Prisma.AgentCreateInput = {
        ip,
        status: "alive",
        lastActive: new Date(Date.now()),
    };

    try {
        const newBot = await prisma.agent.create({
            data: botInfo, 
        });

        const token = jwt.sign(
            {
              id: newBot.id,
              ip: newBot.ip,
              status: newBot.status,
              current: 0
            },
            secretKey, 
            { expiresIn: "30d" } 
          );

        console.log("Bot registered with IP:", req.body.ip);
        res.status(200).send({ token, newBot });
    } catch (error) {
        console.error("Error registering bot:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});


botRouter.post("/execution", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const {command, output, date} = req.body
    const user = req.user 

    if (!user.current){
        res.status(403).send({ error: "Invalid user current" });
        return 
    }

    const executionInfo: Prisma.StepCreateInput = {
        command,
        output,
        ranAt: new Date(Date.now()),
        report: {
            connect: {
                id: user.current
            }
        }
    }
    try{
        const newExecution = await prisma.step.create({data: executionInfo})
        res.status(200).send({ newExecution });
    }catch(error){
        console.error("Error creating execution:", error);
        res.status(500).send({ error: "Internal server error" });
    }
    
})

botRouter.post("/verdict", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const {verdict} = req.body 
    const user = req.user
    console.log(user)

    if (!user.current){
        res.status(403).send({ error: "Invalid user current" });
        return 
    }

    try {
        const updatedReport = await prisma.report.update({
          where: { id: user.current }, 
          data: { verdict }, 
        });

    
        res.status(200).send({ message: "Verdict updated successfully", updatedReport });
      } catch (error) {
        console.error("Error updating verdict:", error);
        res.status(500).send({ error: "Internal server error" });
      }
})

botRouter.post("/error", async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user 

    if (!user.current){
        res.status(403).send({ error: "Invalid user current" });
        return 
    }

    try {
        const hashedSecret = await bcrypt.hash(process.env.SECRET_KEY || "", 10);

        const updatedReport = await prisma.report.update({
          where: { id: user.current }, 
          data: { verdict: "potential vulnerability" }, 
        });

        const token = jwt.sign(
            {
              id: user.id,
              ip: user.ip,
              status: user.status,
              current: 0
            },
            hashedSecret, 
            { expiresIn: "30d" } 
          );
    
        res.status(200).send({ message: "Verdict updated successfully", updatedReport, token});
      } catch (error) {
        console.error("Error updating verdict:", error);
        res.status(500).send({ error: "Internal server error" });
      }
})

export default botRouter