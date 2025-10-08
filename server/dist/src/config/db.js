"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDB = exports.connectDB = void 0;
// server/src/config/db.ts
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
// Initialize cache (avoid ||= for older TS targets)
if (typeof global.__mongoose === "undefined" || global.__mongoose === undefined) {
    global.__mongoose = { conn: null, promise: null };
}
function sanitizeUri(uri) {
    // Hide credentials if present
    return uri.replace(/\/\/[^/@]+@/, "//***:***@");
}
const connectDB = async () => {
    const cache = global.__mongoose;
    if (cache.conn)
        return cache.conn;
    const uri = env_1.env.MONGO_URI;
    if (!uri)
        throw new Error("MONGO_URI is missing");
    const isSrv = uri.startsWith("mongodb+srv://");
    const opts = {
        maxPoolSize: env_1.env.isProd ? 20 : 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        autoIndex: !env_1.env.isProd, // build indexes automatically in dev
        ...(isSrv ? {} : { directConnection: true }),
    };
    try {
        const logUri = sanitizeUri(uri);
        if (!cache.promise) {
            cache.promise = mongoose_1.default.connect(uri, opts).then((m) => m);
        }
        cache.conn = await cache.promise;
        let dbName = "(unknown)";
        try {
            const u = new URL(uri);
            dbName = u.pathname?.replace(/^\//, "") || "(default)";
        }
        catch {
            // ignore URL parse errors for non-standard URIs
        }
        console.log(`✅ Mongo connected (db: ${dbName})`);
    }
    catch (e) {
        console.error("❌ Initial Mongo connect failed:", e?.message || e);
        cache.promise = null;
        throw e;
    }
    const conn = mongoose_1.default.connection;
    conn.on("connected", () => console.log("🔗 Mongo connection established"));
    conn.on("disconnected", () => console.warn("⚠️  Mongo disconnected"));
    conn.on("reconnected", () => console.log("🔁 Mongo reconnected"));
    conn.on("error", (err) => console.error("❌ Mongo error:", err?.message || err));
    return cache.conn;
};
exports.connectDB = connectDB;
const closeDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        if (global.__mongoose) {
            global.__mongoose.conn = null;
            global.__mongoose.promise = null;
        }
        console.log("🔌 Mongo connection closed");
    }
    catch (err) {
        console.error("❌ Error closing Mongo connection:", err?.message || err);
    }
};
exports.closeDB = closeDB;
//# sourceMappingURL=db.js.map