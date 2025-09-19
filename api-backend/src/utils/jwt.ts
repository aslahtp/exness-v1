import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "no token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).id = (decoded as any).id;

    next();
  } catch (e) {
    console.error(e);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
