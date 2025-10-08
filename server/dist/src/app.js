"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
// server/src/app.ts
const env_1 = __importDefault(require("./config/env")); // loads .env.* and exports resolved values
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("./config/db");
// Middlewares (ces fichiers sont en-dehors de src/ chezك)
const security_1 = require("../middlewares/security");
const requestId_1 = require("../middlewares/requestId");
const error_1 = require("../middlewares/error");
const verifyToken_1 = require("../middlewares/verifyToken");
const setCacheControl_1 = require("../middlewares/setCacheControl");
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
// Routes (également hors src/)
const auth_1 = __importDefault(require("../routes/auth"));
const user_1 = __importDefault(require("../routes/user"));
const permission_1 = __importDefault(require("../routes/permission"));
const role_1 = __importDefault(require("../routes/role"));
const patient_1 = __importDefault(require("../routes/patient"));
const measurementType_1 = __importDefault(require("../routes/measurementType"));
const case_1 = __importDefault(require("../routes/case"));
const todo_1 = __importDefault(require("../routes/todo"));
const settings_1 = __importDefault(require("../routes/settings"));
const uploads_1 = __importDefault(require("../routes/uploads"));
const doctor_1 = __importDefault(require("../routes/doctor"));
const corsOptions_1 = require("./config/corsOptions");
async function buildApp() {
    await (0, db_1.connectDB)();
    const app = (0, express_1.default)();
    // Core middlewares
    app.disable("x-powered-by");
    app.set("trust proxy", true);
    app.use(requestId_1.requestId);
    app.use(requestId_1.morganLogger);
    // Preflight early
    app.options("*", corsOptions_1.corsPreflight);
    // Security stack (helmet, cors, rate limit, sanitize query-strings)
    app.use(...(0, security_1.securityMiddlewares)());
    // Sanitize Mongo operators in body/query
    app.use((0, express_mongo_sanitize_1.default)());
    // Body parsers
    app.use(express_1.default.json({ limit: "50mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
    // ---------- Static ----------
    const PUBLIC_DIR = env_1.default.PUBLIC_DIR || path_1.default.join(env_1.default.ROOT_DIR, "public");
    const UPLOADS_DIR = env_1.default.UPLOADS_DIR || path_1.default.join(PUBLIC_DIR, "uploads");
    if (!env_1.default.isProd && !fs_1.default.existsSync(PUBLIC_DIR)) {
        console.warn("[static] Public directory missing:", PUBLIC_DIR);
    }
    if (!env_1.default.isProd && !fs_1.default.existsSync(UPLOADS_DIR)) {
        console.warn("[static] Uploads directory missing:", UPLOADS_DIR);
    }
    // Serve /public (optional)
    app.use("/public", express_1.default.static(PUBLIC_DIR));
    // Health check
    app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
    // Serve /uploads with long cache (ensure unique filenames on save)
    app.use("/uploads", express_1.default.static(UPLOADS_DIR, {
        maxAge: "365d",
        setHeaders: (res) => {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        },
    }));
    // ---------- API ----------
    const API = "/api";
    app.use(`${API}/auth`, setCacheControl_1.setCacheControl, auth_1.default);
    app.use(`${API}/user`, verifyToken_1.verifyToken, setCacheControl_1.setCacheControl, user_1.default);
    app.use(`${API}/permission`, verifyToken_1.verifyToken, setCacheControl_1.setCacheControl, permission_1.default);
    app.use(`${API}/role`, verifyToken_1.verifyToken, setCacheControl_1.setCacheControl, role_1.default);
    app.use(`${API}/patient`, verifyToken_1.verifyToken, setCacheControl_1.setCacheControl, patient_1.default);
    app.use(`${API}/measurementtype`, verifyToken_1.verifyToken, setCacheControl_1.setCacheControl, measurementType_1.default);
    app.use(`${API}/cases`, verifyToken_1.verifyToken, setCacheControl_1.setCacheControl, case_1.default);
    app.use(`${API}/todos`, verifyToken_1.verifyToken, setCacheControl_1.setCacheControl, todo_1.default);
    app.use(`${API}/settings`, verifyToken_1.verifyToken, setCacheControl_1.setCacheControl, settings_1.default);
    app.use(`${API}/uploads`, verifyToken_1.verifyToken, setCacheControl_1.setCacheControl, uploads_1.default);
    app.use(`${API}/doctor`, verifyToken_1.verifyToken, setCacheControl_1.setCacheControl, doctor_1.default);
    // 404 + error handler
    app.all("*", error_1.notFound);
    app.use(error_1.errorHandler);
    // Graceful shutdown hooks
    const shutdown = async (signal) => {
        console.log(`\n${signal} received, closing server...`);
        await (0, db_1.closeDB)();
        process.exit(0);
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    console.log("Running in", process.env.NODE_ENV, "mode");
    return app;
}
exports.default = buildApp;
//# sourceMappingURL=app.js.map