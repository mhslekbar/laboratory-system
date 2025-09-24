"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsPreflight = exports.corsOptions = void 0;
exports.securityMiddlewares = securityMiddlewares;
// server/middlewares/security.ts
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const env_1 = require("../src/config/env");
// Transforme "a,b,c" en ["a","b","c"]
const allowedOrigins = (env_1.env.CORS_ORIGIN || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
exports.corsOptions = {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Cache-Control", // ajouté pour ton cas
    ],
    exposedHeaders: ["Content-Length", "Content-Range"],
    maxAge: 86400, // cache preflight 24h
    optionsSuccessStatus: 204,
};
// Middleware pour gérer les preflights
exports.corsPreflight = (0, cors_1.default)(exports.corsOptions);
function securityMiddlewares() {
    return [
        (0, helmet_1.default)({ crossOriginResourcePolicy: false }),
        (0, cors_1.default)(exports.corsOptions),
        (0, express_mongo_sanitize_1.default)(),
        (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: env_1.isProd ? 300 : 1000,
            standardHeaders: true,
            legacyHeaders: false,
            message: { error: "Too many requests, please try again later." },
        }),
    ];
}
