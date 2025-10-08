// server/src/config/db.ts
import mongoose from "mongoose";
import { env } from "./env";

/**
 * Cache the connection across reloads (dev/nodemon).
 */
type MConn = typeof mongoose;

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: { conn: MConn | null; promise: Promise<MConn> | null } | undefined;
}

// Initialize cache (avoid ||= for older TS targets)
if (typeof global.__mongoose === "undefined" || global.__mongoose === undefined) {
  global.__mongoose = { conn: null, promise: null };
}

function sanitizeUri(uri: string) {
  // Hide credentials if present
  return uri.replace(/\/\/[^/@]+@/, "//***:***@");
}

export const connectDB = async (): Promise<MConn> => {
  const cache = global.__mongoose as { conn: MConn | null; promise: Promise<MConn> | null };

  if (cache.conn) return cache.conn;

  const uri = env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing");

  const isSrv = uri.startsWith("mongodb+srv://");

  const opts: mongoose.ConnectOptions = {
    maxPoolSize: env.isProd ? 20 : 10,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    autoIndex: !env.isProd, // build indexes automatically in dev
    ...(isSrv ? {} : { directConnection: true }),
  };

  try {
    const logUri = sanitizeUri(uri);
    if (!cache.promise) {
      cache.promise = mongoose.connect(uri, opts).then((m) => m);
    }
    cache.conn = await cache.promise;

    let dbName = "(unknown)";
    try {
      const u = new URL(uri);
      dbName = u.pathname?.replace(/^\//, "") || "(default)";
    } catch {
      // ignore URL parse errors for non-standard URIs
    }
    console.log(`✅ Mongo connected (db: ${dbName})`);
  } catch (e: any) {
    console.error("❌ Initial Mongo connect failed:", e?.message || e);
    cache.promise = null;
    throw e;
  }

  const conn = mongoose.connection;
  conn.on("connected", () => console.log("🔗 Mongo connection established"));
  conn.on("disconnected", () => console.warn("⚠️  Mongo disconnected"));
  conn.on("reconnected", () => console.log("🔁 Mongo reconnected"));
  conn.on("error", (err) => console.error("❌ Mongo error:", err?.message || err));

  return cache.conn!;
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();
    if (global.__mongoose) {
      global.__mongoose.conn = null;
      global.__mongoose.promise = null;
    }
    console.log("🔌 Mongo connection closed");
  } catch (err: any) {
    console.error("❌ Error closing Mongo connection:", err?.message || err);
  }
};
