// server/middlewares/error.ts
import { NextFunction, Request, Response } from "express";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Not Found" });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  const payload: any = { error: err.message || "Internal Server Error" };
  if (process.env.NODE_ENV !== "production" && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
}
