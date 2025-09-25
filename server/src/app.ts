// server/src/app.ts
import env from "./config/env";            // loads .env.* and exports resolved values

import express from "express";
import path from "path";
import fs from "fs";

import { connectDB, closeDB } from "./config/db";

// Middlewares (ces fichiers sont en-dehors de src/ chezك)
import { corsPreflight, securityMiddlewares } from "../middlewares/security";
import { requestId, morganLogger } from "../middlewares/requestId";
import { notFound, errorHandler } from "../middlewares/error";
import { verifyToken } from "../middlewares/verifyToken";
import { setCacheControl } from "../middlewares/setCacheControl";
import ExpressMongoSanitize from "express-mongo-sanitize";

// Routes (également hors src/)
import AuthRoute from "../routes/auth";
import UserRoute from "../routes/user";
import PermissionRoute from "../routes/permission";
import RoleRoute from "../routes/role";
import PatientRoute from "../routes/patient";
import MeasurementTypeRoute from "../routes/measurementType";
import CaseRoute from "../routes/case";
import TodoRoute from "../routes/todo";
import SettingsRoute from "../routes/settings";
import uploadsRoute from "../routes/uploads";
import doctorRoutes from "../routes/doctor";

export async function buildApp() {
  await connectDB();

  const app = express();

  // Core middlewares
  app.disable("x-powered-by");
  app.set("trust proxy", true);
  app.use(requestId);
  app.use(morganLogger);

  // Preflight early
  app.options("*", corsPreflight);

  // Security stack (helmet, cors, rate limit, sanitize query-strings)
  app.use(...securityMiddlewares());

  // Sanitize Mongo operators in body/query
  app.use(ExpressMongoSanitize());

  // Body parsers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // ---------- Static ----------
  const PUBLIC_DIR  = env.PUBLIC_DIR || path.join(env.ROOT_DIR, "public");
  const UPLOADS_DIR = env.UPLOADS_DIR || path.join(PUBLIC_DIR, "uploads");

  if (!env.isProd && !fs.existsSync(PUBLIC_DIR)) {
    console.warn("[static] Public directory missing:", PUBLIC_DIR);
  }
  if (!env.isProd && !fs.existsSync(UPLOADS_DIR)) {
    console.warn("[static] Uploads directory missing:", UPLOADS_DIR);
  }

  // Serve /public (optional)
  app.use("/public", express.static(PUBLIC_DIR));

  // Health check
  app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

  // Serve /uploads with long cache (ensure unique filenames on save)
  app.use(
    "/uploads",
    express.static(UPLOADS_DIR, {
      maxAge: "365d",
      setHeaders: (res) => {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      },
    })
  );

  // ---------- API ----------
  const API = "/api";

  app.use(`${API}/auth`, setCacheControl, AuthRoute);
  app.use(`${API}/user`, verifyToken, setCacheControl, UserRoute);
  app.use(`${API}/permission`, verifyToken, setCacheControl, PermissionRoute);
  app.use(`${API}/role`, verifyToken, setCacheControl, RoleRoute);
  app.use(`${API}/patient`, verifyToken, setCacheControl, PatientRoute);
  app.use(`${API}/measurementtype`, verifyToken, setCacheControl, MeasurementTypeRoute);
  app.use(`${API}/cases`, verifyToken, setCacheControl, CaseRoute);
  app.use(`${API}/todos`, verifyToken, setCacheControl, TodoRoute);
  app.use(`${API}/settings`, verifyToken, setCacheControl, SettingsRoute);
  app.use(`${API}/uploads`, verifyToken, setCacheControl, uploadsRoute);
  app.use(`${API}/doctor`, verifyToken, setCacheControl, doctorRoutes);

  // 404 + error handler
  app.all("*", notFound);
  app.use(errorHandler);

  // Graceful shutdown hooks
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, closing server...`);
    await closeDB();
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  return app;
}

export default buildApp;
