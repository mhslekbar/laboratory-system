// src/config/limits.ts
import rateLimit from "express-rate-limit";

const isProd = process.env.NODE_ENV === "production";

const common = {
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: isProd, // only true behind real proxy
};

export const baseLimiter = rateLimit({ ...common, windowMs: 15*60*1000, limit: 200 });
export const lightLimiter = rateLimit({ ...common, windowMs: 60*1000,   limit: 60  });
