"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsPreflight = exports.corsOptions = void 0;
exports.securityMiddlewares = securityMiddlewares;
// server/middlewares/security.ts
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importStar(require("express-rate-limit"));
// Optional if already used in app.ts
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
/* ================================
   Safe ENV helpers
================================ */
const getNum = (v, def) => {
    const n = parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) && n > 0 ? n : def;
};
// Allow env overrides (fallback to sane defaults)
const RL_WINDOW_MS = getNum(process.env.RATE_LIMIT_WINDOW_MS, 60000); // 60s
let RL_MAX = getNum(process.env.RATE_LIMIT_MAX, 300); // 300/min
if (RL_MAX <= 0)
    RL_MAX = 300;
/* ================================
   CORS
================================ */
const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
// Always include localhost for dev
const defaultOrigins = [
    "http://localhost:3000",
    "http://localhost:3051",
    "http://127.0.0.1:3051",
    "https://medepratlab.com",
    "https://www.medepratlab.com",
    "https://api.medepratlab.com",
];
const origins = [...new Set([...defaultOrigins, ...allowedOrigins])];
exports.corsOptions = {
    origin(origin, cb) {
        // Allow non-browser tools (curl/postman) with no origin
        if (!origin)
            return cb(null, true);
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
    maxAge: 86400, // cache preflight for 24h
    optionsSuccessStatus: 204,
};
// Preflight helper
exports.corsPreflight = (0, cors_1.default)(exports.corsOptions);
/* ================================
   Rate limiting
   IMPORTANT: app.set("trust proxy", true) must be set in your app
================================ */
// Base limiter applied to most routes
const baseLimiter = (0, express_rate_limit_1.default)({
    windowMs: RL_WINDOW_MS,
    max: RL_MAX,
    standardHeaders: true, // RateLimit-* headers
    legacyHeaders: false,
    // ✅ Normalize IPv4/IPv6 safely to avoid ERR_ERL_KEY_GEN_IPV6
    keyGenerator: (req) => (0, express_rate_limit_1.ipKeyGenerator)(req),
    message: { error: "Too many requests, please try again later." },
});
// Very light limiter for harmless/public endpoints
const lightLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60000,
    max: 10000, // practically unlimited per minute
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (0, express_rate_limit_1.ipKeyGenerator)(req),
});
/* ================================
   Security middleware stack
================================ */
function securityMiddlewares() {
    // console.log("origins: ", origins);
    // console.log("process.env.CORS_ORIGIN: ", process.env.CORS_ORIGIN);
    return [
        (0, helmet_1.default)({ crossOriginResourcePolicy: false }),
        (0, cors_1.default)(exports.corsOptions),
        (0, express_mongo_sanitize_1.default)(),
        // Route-aware rate-limiter switch
        (req, res, next) => {
            const p = req.path;
            // Health checks → super light limiter
            if (p === "/health" || p === "/api/health" || p === "/api/ping") {
                return lightLimiter(req, res, next);
            }
            // Settings bootstrap endpoint → light limiter
            if (p === "/api/settings/general") {
                return lightLimiter(req, res, next);
            }
            // Everything else → base limiter
            return baseLimiter(req, res, next);
        },
    ];
}
//# sourceMappingURL=security.js.map