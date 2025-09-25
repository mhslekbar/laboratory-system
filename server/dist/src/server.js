"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/server.ts
const env_1 = __importDefault(require("./config/env"));
const app_1 = __importDefault(require("./app"));
(async () => {
    try {
        const app = await (0, app_1.default)();
        const port = env_1.default.PORT || 3052;
        const server = app.listen(port, () => {
            console.log(`🚀 API listening on http://localhost:${port} (env=${env_1.default.NODE_ENV})`);
        });
        // Optional: handle unhandled rejections at process level
        process.on("unhandledRejection", (err) => {
            console.error("❌ Unhandled Rejection:", err?.message || err);
        });
        process.on("uncaughtException", (err) => {
            console.error("❌ Uncaught Exception:", err?.message || err);
            server.close(() => process.exit(1));
        });
    }
    catch (e) {
        console.error("❌ Failed to start server:", e?.message || e);
        process.exit(1);
    }
})();
