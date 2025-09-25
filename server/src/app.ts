// server/src/app/app.ts
import express from "express";
import path from "path";
// ⬇️ use Express’ built-ins instead of body-parser
import { closeDB, connectDB } from "./config/db";
import { corsPreflight, securityMiddlewares } from "../middlewares/security";
import { requestId, morganLogger } from "../middlewares/requestId";
import { notFound, errorHandler } from "../middlewares/error";

// Your middlewares
import { verifyToken } from "../middlewares/verifyToken";
import { setCacheControl } from "../middlewares/setCacheControl";

// Your routes
import AuthRoute from "../routes/auth";
import UserRoute from "../routes/user";
import PermissionRoute from "../routes/permission";
import RoleRoute from "../routes/role";
import PatientRoute from "../routes/patient";
import MeasurementTypeRoute from "../routes/measurementType";
import CaseRoute from "../routes/case";
import ExpressMongoSanitize from "express-mongo-sanitize";
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

  // ✅ Répond aux OPTIONS (preflight) avant le reste
  app.options("*", corsPreflight);

  // Pile de sécu (inclut CORS principal)
  app.use(...securityMiddlewares());

  app.use(ExpressMongoSanitize());

  // Parsers (limits as needed)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));


  // Static (optional)
  app.use("/public", express.static(path.join(process.cwd(), "public")));

  // Health check
  app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

  // Servez le dossier /uploads comme statique pour pouvoir charger les images
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "public", "uploads"))
  );
  // API prefix (no trailing slash)
  const API = "/api";

  // Routes
  app.use(`${API}/auth`, setCacheControl, AuthRoute);
  app.use(`${API}/user`, verifyToken, setCacheControl, UserRoute);
  app.use(`${API}/permission`, verifyToken, setCacheControl, PermissionRoute);
  app.use(`${API}/role`, verifyToken, setCacheControl, RoleRoute);
  app.use(`${API}/patient`, verifyToken, setCacheControl, PatientRoute);
  app.use(`${API}/measurementtype`, verifyToken, setCacheControl, MeasurementTypeRoute);
  app.use(`${API}/cases`, verifyToken, setCacheControl, CaseRoute);
  app.use(`${API}/todos`, verifyToken, setCacheControl, TodoRoute);
  app.use(`${API}/settings`,verifyToken, setCacheControl, SettingsRoute);
  app.use(`${API}/uploads`, verifyToken, setCacheControl, uploadsRoute);
  app.use(`${API}/doctor`, verifyToken, setCacheControl, doctorRoutes);

  // 404 + error handler
  app.all("*", notFound);
  app.use(errorHandler);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, closing server...`);
    await closeDB();
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  return app;
}
