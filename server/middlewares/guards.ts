// server/middlewares/guards.ts
import { NextFunction, Response } from "express";
import { AuthRequest } from "./verifyToken";

export const requireDoctor = (req: AuthRequest, res: Response, next: NextFunction) => {
  const isDoctor = !!req?.user?.doctor?.isDoctor;
  if (!isDoctor) return res.status(403).json(["Accès réservé au médecin"]);
  next();
};
