import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: any; 
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).send({ error: "Authorization header is missing" });
    return 
  }

  const token = authHeader.split(" ")[0]; 

  if (!token) {
    res.status(401).send({ error: "Token is missing" });
    return 
  }

  try {
    const secretKey = process.env.SECRET_KEY || "default-secret-key";
    const decoded = jwt.verify(token, secretKey);

    req.user = decoded;

    next();
  } catch (error) {
    res.status(403).send({ error: "Invalid or expired token" });
    return 
  }
};
