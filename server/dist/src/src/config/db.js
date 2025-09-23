"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.closeDB = closeDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectDB() {
    mongoose_1.default.set("strictQuery", true);
    // Register listeners BEFORE connecting
    mongoose_1.default.connection.on("connected", () => {
        console.log(`✅ Mongo connected`); //: ${env.MONGO_URL}
    });
    mongoose_1.default.connection.on("error", (err) => {
        console.error("❌ Mongo error:", err?.message || err);
    });
    mongoose_1.default.connection.on("disconnected", () => {
        console.warn("⚠️ Mongo disconnected");
    });
    try {
        await mongoose_1.default.connect(env_1.env.MONGO_URL, {
            autoIndex: env_1.env.NODE_ENV !== "production",
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            // helpful for localhost single node:
            directConnection: true,
        });
        // Fallback log in case the event fired too early in some environments
        if (mongoose_1.default.connection.readyState === 1) {
            console.log("✅ Mongo connected (await)");
        }
    }
    catch (err) {
        console.error("❌ Initial Mongo connect failed:", err?.message || err);
        throw err;
    }
}
async function closeDB() {
    await mongoose_1.default.connection.close();
}
