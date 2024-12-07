import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

export interface AuthenticatedRequest extends Request {
  user?: any; 
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
    console.log(process.env.SECRET_KEY)
    const secretKey = process.env.SECRET_KEY || "LOL";
    console.log(secretKey)
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;

    next();
  } catch (error) {
    console.error(error)
    res.status(403).send({ error: "Invalid or expired token" });
    return 
  }
};
