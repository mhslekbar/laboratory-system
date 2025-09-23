// server/middlewares/errorHandler.ts
import { NextFunction, Request, Response } from "express";
export default function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  const payload = { err: err.message || "Internal Server Error" };
  if (process.env.NODE_ENV !== "production" && err.stack) (payload as any).stack = err.stack;
  res.status(status).json(payload);
}
