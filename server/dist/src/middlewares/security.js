"use strict";
// server/middlewares/security.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddlewares = securityMiddlewares;
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const env_1 = require("../config/env");
function securityMiddlewares() {
    const corsOptions = {
        origin: env_1.env.CORS_ORIGIN ? [env_1.env.CORS_ORIGIN] : true, // refine as needed
        credentials: true,
        optionsSuccessStatus: 200,
    };
    return [
        (0, helmet_1.default)({ crossOriginResourcePolicy: false }),
        (0, cors_1.default)(corsOptions),
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
