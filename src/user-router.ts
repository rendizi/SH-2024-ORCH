import { Request, Response, Router } from "express";
import prisma from "./prisma";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, authMiddleware } from "./middleware";
const userRouter = Router()

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh-secret";

const refreshTokens: string[] = [];

userRouter.post("/register", async(req: Request, res: Response)=>{
    try {
        const { email, password } = req.body;
    
        if (!email || !password) {
          res.status(400).json({ message: "Email and password are required" });
          return 
        }
    
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });
    
        if (existingUser) {
          res.status(400).json({ message: "User already exists" });
          return 
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const newUser = await prisma.user.create({
          data: { email, password: hashedPassword },
        });
    
        res.status(201).json({ message: "User registered successfully", userId: newUser.id });
      } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
      }
})

userRouter.post("/login", async(req: Request, res: Response)=>{
    try {
        const { email, password } = req.body;
    
        if (!email || !password) {
          res.status(400).json({ message: "Email and password are required" });
          return 
        }
    
        const user = await prisma.user.findUnique({
          where: { email },
        });
    
        if (!user) {
          res.status(401).json({ message: "Invalid email or password" });
          return 
        }
    
        const passwordMatch = await bcrypt.compare(password, user.password);
    
        if (!passwordMatch) {
          res.status(401).json({ message: "Invalid email or password" });
          return 
        }
    
        const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET);
    
        refreshTokens.push(refreshToken);
    
        res.status(200).json({ accessToken, refreshToken });
      } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error" });
      }
})

userRouter.post("/refresh-token", async(req: Request, res: Response)=>{
    try {
        const { token } = req.body;
    
        if (!token) {
          res.status(401).json({ message: "Refresh token is required" });
          return 
        }
    
        if (!refreshTokens.includes(token)) {
          res.status(403).json({ message: "Invalid refresh token" });
          return 
        }
    
        jwt.verify(token, REFRESH_TOKEN_SECRET, (err: any, user: any) => {
          if (err) {
            res.status(403).json({ message: "Invalid refresh token" });
            return 
          }
    
          const newAccessToken = jwt.sign({ userId: user.userId }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
          res.status(200).json({ accessToken: newAccessToken });
        });
      } catch (error) {
        console.error("Error refreshing token:", error);
        res.status(500).json({ message: "Internal server error" });
      }
})

userRouter.post("/service" ,async(req: Request, res: Response)=>{
    try {
        const {token} = req.body
        console.log(token)
    
        jwt.verify(token, ACCESS_TOKEN_SECRET, async (err: any, user: any) => {
          if (err) {
            console.log(err)
          }
    
          const { ip, domain } = req.body;
    
          const newService = await prisma.service.create({
            data: { ip, domain, user: {
                connect:{
                    id: user.userId
                }
            } },
          });
    
          res.status(200).json({ message: "Service processed successfully", serviceId: newService.id });
        });
      } catch (error) {
        console.error("Error processing service:", error);
        res.status(500).json({ message: "Internal server error" });
      }
})

userRouter.post("/service/technologies", async(req: Request, res: Response) => {
    try{
        const {serviceId, technologies} = req.body 
        console.log(technologies)

        for (const tech of technologies){
            await prisma.technology.create({data: {
                name: tech,
                service: {
                    connect:{
                        id: serviceId
                    }
                }
            }})
        }
        res.status(200).json({ message: "Success" });

    }catch(error){
        console.error("Error processing service:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

userRouter.get("/service/technologies/:serviceId", async (req: Request, res: Response) => {
    try {
      const { serviceId } = req.params;
  
      const technologies = await prisma.technology.findMany({
        where: {
          serviceId: parseInt(serviceId, 10),
        },
      });
  
      if (!technologies || technologies.length === 0) {
        res.status(404).json({ message: "No technologies found for the specified service." });
        return 
      }
  
      res.status(200).json({ technologies });
    } catch (error) {
      console.error("Error fetching technologies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

  userRouter.get("/reports", async (req: Request, res: Response) => {
    try {
      const { exploitId, serviceId, agentId } = req.query;
  
      const reports = await prisma.report.findMany({
        where: {
          exploitId: exploitId ? parseInt(exploitId as string, 10) : undefined,
          serviceId: serviceId ? parseInt(serviceId as string, 10) : undefined,
          agentId: agentId ? parseInt(agentId as string, 10) : undefined,
        },
        include: {
          exploit: true,
          service: true,
          agent: true,
        },
      });
  
      if (reports.length === 0) {
        res.status(404).json({ message: "No reports found." });
        return 
      }
  
      res.status(200).json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

  userRouter.get("/reports/:reportId/steps", async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;
  
      const steps = await prisma.step.findMany({
        where: { reportId: parseInt(reportId, 10) },
      });
  
      if (steps.length === 0) {
        res.status(404).json({ message: "No steps found for the specified report." });
        return 
      }
  
      res.status(200).json(steps);
    } catch (error) {
      console.error("Error fetching steps:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  


export default userRouter