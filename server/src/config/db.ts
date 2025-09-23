import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  mongoose.set("strictQuery", true);

  // Register listeners BEFORE connecting
  mongoose.connection.on("connected", () => {
    console.log(`✅ Mongo connected`); //: ${env.MONGO_URL}
  });
  mongoose.connection.on("error", (err) => {
    console.error("❌ Mongo error:", err?.message || err);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ Mongo disconnected");
  });

  try {
    await mongoose.connect(env.MONGO_URL, {
      autoIndex: env.NODE_ENV !== "production",
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      // helpful for localhost single node:
      directConnection: true,
    } as any);

    // Fallback log in case the event fired too early in some environments
    if (mongoose.connection.readyState === 1) {
      console.log("✅ Mongo connected (await)");
    }
  } catch (err: any) {
    console.error("❌ Initial Mongo connect failed:", err?.message || err);
    throw err;
  }
}

export async function closeDB() {
  await mongoose.connection.close();
}
