// server/middlewares/security.ts
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

// ---- ENV helpers (clamp to safe values) ----
const getNum = (v: any, def: number) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

// Allow env overrides (optional). If undefined/invalid → fallback.
const RL_WINDOW_MS = getNum(process.env.RATE_LIMIT_WINDOW_MS, 60_000); // 1 min
let RL_MAX = getNum(process.env.RATE_LIMIT_MAX, 300);                  // 300/min
if (RL_MAX <= 0) RL_MAX = 300; // never allow 0

// CORS allowlist (from your .env)
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// Always include localhost for development tooling if needed
const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const origins = [...new Set([...defaultOrigins, ...allowedOrigins])];

export const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/postman
    return origins.includes(origin) ? cb(null, true) : cb(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cache-Control"],
  exposedHeaders: ["Content-Length", "Content-Range"],
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

export const corsPreflight = cors(corsOptions);

// Base limiter (sane, never zero)
const baseLimiter = rateLimit({
  windowMs: RL_WINDOW_MS,       // e.g., 60s
  max: RL_MAX,                  // e.g., 300 req/min per IP
  standardHeaders: true,        // RateLimit-* headers
  legacyHeaders: false,
  keyGenerator: (req) =>
    // requires app.set('trust proxy', 1) so req.ip is client IP
    req.ip || (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "anon",
  message: { error: "Too many requests, please try again later." },
});

// Very light limiter (effectively “no limit”) for harmless/public reads
const lightLimiter = rateLimit({
  windowMs: 60_000,
  max: 10_000,                  // practically unlimited per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || "anon",
});

export function securityMiddlewares() {
  return [
    helmet({ crossOriginResourcePolicy: false }),
    cors(corsOptions),
    mongoSanitize(),

    // Route-aware limiter: exempt or lighten specific endpoints
    (req: any, res: any, next: any) => {
      const p = req.path;
      // Health & ping are safe
      if (p === "/health" || p === "/api/health" || p === "/api/ping") {
        return (lightLimiter as any)(req, res, next);
      }
      // Settings general is hit on every app load → use light limiter
      if (p === "/api/settings/general") {
        return (lightLimiter as any)(req, res, next);
      }
      // Everything else → base limiter
      return (baseLimiter as any)(req, res, next);
    },
  ];
}
