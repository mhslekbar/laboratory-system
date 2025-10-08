// server/middlewares/security.ts
import cors from "cors";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
// Optional if already used in app.ts
import mongoSanitize from "express-mongo-sanitize";

/* ================================
   Safe ENV helpers
================================ */
const getNum = (v: any, def: number) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

// Allow env overrides (fallback to sane defaults)
const RL_WINDOW_MS = getNum(process.env.RATE_LIMIT_WINDOW_MS, 60_000); // 60s
let RL_MAX = getNum(process.env.RATE_LIMIT_MAX, 300);                  // 300/min
if (RL_MAX <= 0) RL_MAX = 300;

/* ================================
   CORS
================================ */
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// Always include localhost for dev
const defaultOrigins = [
  "http://localhost:3051",
  "http://127.0.0.1:3051",
  "https://medepratlab.com",
  "https://www.medepratlab.com",
  "https://api.medepratlab.com",
];

const origins = [...new Set([...defaultOrigins, ...allowedOrigins])];

export const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    // Allow non-browser tools (curl/postman) with no origin
    if (!origin) return cb(null, true);
    return origins.includes(origin)
      ? cb(null, true)
      : cb(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Cache-Control",
  ],
  exposedHeaders: ["Content-Length", "Content-Range"],
  maxAge: 86400,           // cache preflight for 24h
  optionsSuccessStatus: 204,
};

// Preflight helper
export const corsPreflight = cors(corsOptions);

/* ================================
   Rate limiting
   IMPORTANT: app.set("trust proxy", true) must be set in your app
================================ */

// Base limiter applied to most routes
const baseLimiter = rateLimit({
  windowMs: RL_WINDOW_MS,
  max: RL_MAX,
  standardHeaders: true,  // RateLimit-* headers
  legacyHeaders: false,
  // ✅ Normalize IPv4/IPv6 safely to avoid ERR_ERL_KEY_GEN_IPV6
  keyGenerator: (req: any) => ipKeyGenerator(req),
  message: { error: "Too many requests, please try again later." },
});

// Very light limiter for harmless/public endpoints
const lightLimiter = rateLimit({
  windowMs: 60_000,
  max: 10_000,            // practically unlimited per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => ipKeyGenerator(req),
});

/* ================================
   Security middleware stack
================================ */
export function securityMiddlewares() {
  // console.log("origins: ", origins);
  // console.log("process.env.CORS_ORIGIN: ", process.env.CORS_ORIGIN);
  return [
    helmet({ crossOriginResourcePolicy: false }),
    cors(corsOptions),
    mongoSanitize(),

    // Route-aware rate-limiter switch
    (req: any, res: any, next: any) => {
      const p = req.path;

      // Health checks → super light limiter
      if (p === "/health" || p === "/api/health" || p === "/api/ping") {
        return (lightLimiter as any)(req, res, next);
      }

      // Settings bootstrap endpoint → light limiter
      if (p === "/api/settings/general") {
        return (lightLimiter as any)(req, res, next);
      }

      // Everything else → base limiter
      return (baseLimiter as any)(req, res, next);
    },
  ];
}
