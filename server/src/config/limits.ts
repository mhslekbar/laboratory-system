// src/config/limits.ts
import rateLimit from "express-rate-limit";

export const baseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,                  // 300 req / 15 min / IP
  standardHeaders: true,
  legacyHeaders: false,
});

export const lightLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 1200,           // plus permissif pour health/bootstrap
  standardHeaders: true,
  legacyHeaders: false,
});
