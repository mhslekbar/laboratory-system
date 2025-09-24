// server/src/config/db.ts (TypeScript) or .js equivalent
import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
  const uri = env.MONGO_URI;
  const isSrv = uri?.startsWith("mongodb+srv://");

  const opts: mongoose.ConnectOptions = {
    // Good defaults
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    // Only use directConnection for non-SRV (mongodb://host:port)
    ...(isSrv ? {} : { directConnection: true }),
  };

  try {
    await mongoose.connect(uri, opts);
    console.log("✅ Mongo connected");
  } catch (e: any) {
    console.error("❌ Initial Mongo connect failed:", e?.message || e);
    throw e;
  }

  mongoose.connection.on("disconnected", () => console.warn("⚠️ Mongo disconnected"));
  mongoose.connection.on("error", (err) => console.error("❌ Mongo error:", err?.message || err));
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("🔌 Mongo connection closed");
  } catch (err: any) {
    console.error("❌ Error closing Mongo connection:", err?.message || err);
  }
};