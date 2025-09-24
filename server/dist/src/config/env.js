"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProd = exports.env = void 0;
// server/config/env.ts
require("dotenv/config");
const zod_1 = require("zod");
const EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().default(3052),
    MONGO_URI: zod_1.z.string().min(1, "MONGO_URL is required"),
    JWT_SEC: zod_1.z.string().min(1, "JWT_SEC is required"),
    // Optional:
    JWT_REFRESH_SEC: zod_1.z.string().optional(),
    CORS_ORIGIN: zod_1.z.string().optional(), // e.g. "http://localhost:3050"
});
const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
exports.isProd = exports.env.NODE_ENV === "production";
