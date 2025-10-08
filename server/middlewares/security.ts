// src/middlewares/security.ts
import helmet from "helmet";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import { corsOptions } from "../src/config/corsOptions";
import { baseLimiter, lightLimiter } from "../src/config/limits";

export function securityMiddlewares() {
  return [
    // Désactive uniquement la CORP pour permettre cross-origin de ton SPA
    helmet({ crossOriginResourcePolicy: false }),

    // CORS strict sur medepratlab.com
    cors(corsOptions),

    // Nettoyage anti-injection Mongo ($, .)
    mongoSanitize(),

    // Rate-limit "route-aware"
    (req: any, res: any, next: any) => {
      const p = req.path;
      if (p === "/health" || p === "/api/health" || p === "/api/ping")
        return (lightLimiter as any)(req, res, next);

      if (p === "/api/settings/general")
        return (lightLimiter as any)(req, res, next);

      return (baseLimiter as any)(req, res, next);
    },
  ];
}
