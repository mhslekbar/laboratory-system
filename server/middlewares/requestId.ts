// server/middlewares/requestId.ts
import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import morgan from "morgan";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

export function requestId(req: Request, _res: Response, next: NextFunction) {
  req.requestId = randomUUID();
  next();
}

morgan.token("id", (req: any) => req.requestId || "-");

export const morganLogger = morgan(':id :method :url :status :res[content-length] - :response-time ms');
