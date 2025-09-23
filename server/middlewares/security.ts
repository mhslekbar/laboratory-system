// server/middlewares/security.ts

import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { env, isProd } from "../src/config/env";

export function securityMiddlewares() {
  const corsOptions: cors.CorsOptions = {
    origin: env.CORS_ORIGIN ? [env.CORS_ORIGIN] : true, // refine as needed
    credentials: true,
    optionsSuccessStatus: 200,
  };

  return [
    helmet({ crossOriginResourcePolicy: false }),
    cors(corsOptions),
    mongoSanitize(),
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isProd ? 300 : 1000,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests, please try again later." },
    }),
  ];
}
