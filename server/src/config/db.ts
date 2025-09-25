// server/src/config/db.ts
import mongoose from "mongoose";
import { env } from "./env";

/**
 * Optional: cache connection in dev to avoid multiple connects
 * when using ts-node/nodemon.
 */
type MConn = typeof mongoose;
declare global {
  // eslint-disable-next-line no-var
  var __mongoose: { conn: MConn | null; promise: Promise<MConn> | null } | undefined;
}
global.__mongoose ||= { conn: null, promise: null };

function sanitizeUri(uri: string) {
  // Hide credentials if present
  return uri.replace(/\/\/[^/@]+@/, "//***:***@");
}

export const connectDB = async () => {
  if (global.__mongoose?.conn) return global.__mongoose.conn;

  const uri = env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing");

  const isSrv = uri.startsWith("mongodb+srv://");

  const opts: mongoose.ConnectOptions = {
    maxPoolSize: env.isProd ? 20 : 10,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    autoIndex: !env.isProd,
    ...(isSrv ? {} : { directConnection: true }),
  };

  try {
    const logUri = sanitizeUri(uri);
    if (!global.__mongoose!.promise) {
      global.__mongoose!.promise = mongoose.connect(uri, opts).then((m) => m);
      console.log(`⏳ Connecting MongoDB → ${logUri}`);
    }
    global.__mongoose!.conn = await global.__mongoose!.promise;
    const dbName = (() => {
      try {
        const u = new URL(uri);
        return u.pathname?.replace(/^\//, "") || "(default)";
      } catch {
        return "(unknown)";
      }
    })();
    console.log(`✅ Mongo connected (db: ${dbName})`);
  } catch (e: any) {
    console.error("❌ Initial Mongo connect failed:", e?.message || e);
    global.__mongoose!.promise = null;
    throw e;
  }

  mongoose.connection.on("connected", () => {
    console.log("🔗 Mongo connection established");
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  Mongo disconnected");
  });
  mongoose.connection.on("reconnected", () => {
    console.log("🔁 Mongo reconnected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("❌ Mongo error:", err?.message || err);
  });

  return global.__mongoose!.conn;
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();
    global.__mongoose = { conn: null, promise: null };
    console.log("🔌 Mongo connection closed");
  } catch (err: any) {
    console.error("❌ Error closing Mongo connection:", err?.message || err);
  }
};
