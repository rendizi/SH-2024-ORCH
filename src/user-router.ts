import { Request, Response, Router } from "express";
import prisma from "./prisma";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, authMiddleware } from "./middleware";
const userRouter = Router()

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "LOL";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "LOL";

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
    
        const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: "8h" });
        const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET);
    
        refreshTokens.push(refreshToken);
    
        res.status(200).json({ accessToken, refreshToken });
      } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error" });
      }
})

userRouter.post("/telegram", async(req: Request, res: Response) => {
  try{
    const {telegramId, email} = req.body
    const user = await prisma.user.findFirst({where:{email}})
    await prisma.telegram.create({data: {telegramId, user:{connect:{id: user?.id}}}})
  }catch(err){
    console.error("Error refreshing token:", err);
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
    
          const newAccessToken = jwt.sign({ userId: user.userId }, ACCESS_TOKEN_SECRET, { expiresIn: "8h" });
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
  
  userRouter.get("/vulnerabilities/count", async (req: Request, res: Response) => {
    try {
      const { userId, serviceId } = req.query;
  
      const whereClause: any = {};
      if (userId) {
        whereClause.service = {
          userId: parseInt(userId as string, 10),
        };
      }
      if (serviceId) {
        whereClause.serviceId = parseInt(serviceId as string, 10);
      }

      const allVulnCount = await prisma.report.count();
      const potentialVulnCount = await prisma.report.count({
        where: { verdict: "potential vulnerability",...whereClause  },
      });
      const realVulnCount = await prisma.report.count({
        where: { verdict: "real vulnerability",...whereClause },
      });
      const noVulnCount = await prisma.report.count({
        where: { verdict: "no vulnerability",...whereClause },
      });
  
      res.status(200).json({
        allVulnCount,
        potentialVulnCount,
        realVulnCount,
        noVulnCount,
      });
    } catch (error) {
      console.error("Error fetching vulnerability counts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  userRouter.get("/vulnerabilities/by-days", async (req: Request, res: Response) => {
    try {
      const { userId, serviceId } = req.query;
  
      const whereClause: any = {};
      if (userId) {
        whereClause.service = {
          userId: parseInt(userId as string, 10),
        };
      }
      if (serviceId) {
        whereClause.serviceId = parseInt(serviceId as string, 10);
      }
  
      const vulnerabilitiesByDays = await prisma.report.groupBy({
        by: ["createdAt"],
        where: whereClause,
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      });
  
      res.status(200).json(vulnerabilitiesByDays);
    } catch (error) {
      console.error("Error fetching vulnerabilities by days:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

  userRouter.get("/service/vulnerabilities", async (req: Request, res: Response) => {
    try {
      const { serviceId } = req.query;
  
      const vulnerabilities = await prisma.report.findMany({
        where: {
          serviceId: serviceId ? parseInt(serviceId as string, 10) : undefined,
        },
        include: {
          service: true,
          exploit: true,
        },
      });

  
      res.status(200).json(vulnerabilities);
    } catch (error) {
      console.error("Error fetching service vulnerabilities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  userRouter.get("/reports/:reportId/history", async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;
  
      const steps = await prisma.step.findMany({
        where: { reportId: parseInt(reportId, 10) },
        select: {
          command: true,
          output: true,
          ranAt: true,
        },
      });
  
      res.status(200).json(steps);
    } catch (error) {
      console.error("Error fetching report history:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  
  userRouter.get("/services", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
  
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
  
      const services = await prisma.service.findMany({
        where: { userId },
        include: {
          technologies: true,
          reports: true,
        },
      });
  
      if (services.length === 0) {
        res.status(404).json({ message: "No services found for the user." });
        return;
      }
  
      res.status(200).json({ services });
    } catch (error) {
      console.error("Error fetching user services:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  userRouter.get("/me", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
  
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
  
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          services: true,
          telegrams: true,
        },
      });
  
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }
  
      res.status(200).json({ user });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  userRouter.get("/exploits", async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query;
  
      // Convert page and limit to numbers
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
  
      if (pageNumber < 1 || limitNumber < 1) {
        res.status(400).json({ message: "Page and limit must be positive integers" });
        return 
      }
  
      const totalExploits = await prisma.exploit.count();
  
      const exploits = await prisma.exploit.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        orderBy: { createdAt: "desc" }, // Sort by latest created
      });
  
      res.status(200).json({
        total: totalExploits,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalExploits / limitNumber),
        exploits,
      });
    } catch (error) {
      console.error("Error fetching paginated exploits:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  

export default userRouter