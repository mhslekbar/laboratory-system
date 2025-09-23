// server/middlwares/setCacheControl.ts

import { Request, Response } from "express";

export const setCacheControl = (req: Request, res: Response, next: any) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
};
