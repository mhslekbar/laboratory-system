"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDB = exports.connectDB = void 0;
// server/src/config/db.ts (TypeScript) or .js equivalent
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    const uri = env_1.env.MONGO_URI;
    const isSrv = uri?.startsWith("mongodb+srv://");
    const opts = {
        // Good defaults
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        // Only use directConnection for non-SRV (mongodb://host:port)
        ...(isSrv ? {} : { directConnection: true }),
    };
    try {
        await mongoose_1.default.connect(uri, opts);
        console.log("✅ Mongo connected");
    }
    catch (e) {
        console.error("❌ Initial Mongo connect failed:", e?.message || e);
        throw e;
    }
    mongoose_1.default.connection.on("disconnected", () => console.warn("⚠️ Mongo disconnected"));
    mongoose_1.default.connection.on("error", (err) => console.error("❌ Mongo error:", err?.message || err));
};
exports.connectDB = connectDB;
const closeDB = async () => {
    try {
        await mongoose_1.default.connection.close();
        console.log("🔌 Mongo connection closed");
    }
    catch (err) {
        console.error("❌ Error closing Mongo connection:", err?.message || err);
    }
};
exports.closeDB = closeDB;
