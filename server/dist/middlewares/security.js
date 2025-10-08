"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddlewares = securityMiddlewares;
// src/middlewares/security.ts
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const corsOptions_1 = require("../src/config/corsOptions");
const limits_1 = require("../src/config/limits");
function securityMiddlewares() {
    return [
        // Désactive uniquement la CORP pour permettre cross-origin de ton SPA
        (0, helmet_1.default)({ crossOriginResourcePolicy: false }),
        // CORS strict sur medepratlab.com
        (0, cors_1.default)(corsOptions_1.corsOptions),
        // Nettoyage anti-injection Mongo ($, .)
        (0, express_mongo_sanitize_1.default)(),
        // Rate-limit "route-aware"
        (req, res, next) => {
            const p = req.path;
            if (p === "/health" || p === "/api/health" || p === "/api/ping")
                return limits_1.lightLimiter(req, res, next);
            if (p === "/api/settings/general")
                return limits_1.lightLimiter(req, res, next);
            return limits_1.baseLimiter(req, res, next);
        },
    ];
}
//# sourceMappingURL=security.js.map