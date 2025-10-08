"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProd = exports.env = void 0;
// server/src/config/env.ts
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const NODE_ENV = (process.env.NODE_ENV || "development").trim();
// مكان ملفات .env (جذر مشروع السيرفر)
const ENV_ROOT = path_1.default.resolve(__dirname, "../.."); // ⬅️ يشير إلى server/
// ترتيب التحميل (الأعلى أولوية أولاً)
const CANDIDATES = [
    `.env.${NODE_ENV}.local`,
    `.env`,
].map((f) => path_1.default.join(ENV_ROOT, f));
// حمّل الموجود منها (override=true)
for (const p of CANDIDATES) {
    if (fs_1.default.existsSync(p))
        dotenv_1.default.config({ path: p, override: true });
}
/* =========== Helpers =========== */
const get = (k, def) => process.env[k] && String(process.env[k]) !== "" ? String(process.env[k]) : def;
const getNum = (k, def) => {
    const v = get(k);
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : def;
};
const splitCSV = (s) => (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
/* =========== Defaults الذكية =========== */
const ROOT_DIR = get("ROOT_DIR", ENV_ROOT);
const PUBLIC_DIR = get("PUBLIC_DIR", path_1.default.join(ROOT_DIR, "public"));
const UPLOADS_DIR = get("UPLOADS_DIR", path_1.default.join(PUBLIC_DIR, "uploads"));
exports.env = {
    NODE_ENV,
    isProd: NODE_ENV === "production",
    PORT: getNum("PORT", 3062),
    MONGO_URI: NODE_ENV === "production" ? get("MONGO_URI", "mongodb+srv://sniper:1212@cluster0.p4xc21i.mongodb.net/lab_system?retryWrites=true&w=majority") : get("MONGO_URI", "mongodb://127.0.0.1:27017/lab_system"),
    JWT_SEC: get("JWT_SEC", ""),
    JWT_REFRESH_SEC: get("JWT_REFRESH_SEC", ""),
    CORS_ORIGIN_LIST: splitCSV(get("CORS_ORIGIN", "")),
    // Static paths
    ROOT_DIR: ROOT_DIR,
    PUBLIC_DIR: PUBLIC_DIR,
    UPLOADS_DIR: UPLOADS_DIR,
    // Rate limit
    RATE_LIMIT_WINDOW_MS: getNum("RATE_LIMIT_WINDOW_MS", 60000),
    RATE_LIMIT_MAX: getNum("RATE_LIMIT_MAX", 300),
    // Timezone (اختياري)
    TZ: get("TZ", "Africa/Nouakchott"),
};
exports.isProd = exports.env.isProd;
exports.default = exports.env;
//# sourceMappingURL=env.js.map