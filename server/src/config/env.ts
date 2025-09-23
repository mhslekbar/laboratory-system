// server/config/env.ts
import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3052),
  MONGO_URL: z.string().min(1, "MONGO_URL is required"),
  JWT_SEC: z.string().min(1, "JWT_SEC is required"),
  // Optional:
  JWT_REFRESH_SEC: z.string().optional(),
  CORS_ORIGIN: z.string().optional(), // e.g. "http://localhost:3050"
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
