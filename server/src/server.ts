// server/src/server.ts
import env from "./config/env";
import buildApp from "./app";

(async () => {
  try {
    const app = await buildApp();
    const port = env.PORT || 3062;

    const server = app.listen(port, () => {
      console.log(`🚀 API listening on http://localhost:${port} (env=${env.NODE_ENV})`);
    });

    // Optional: handle unhandled rejections at process level
    process.on("unhandledRejection", (err: any) => {
      console.error("❌ Unhandled Rejection:", err?.message || err);
    });

    process.on("uncaughtException", (err: any) => {
      console.error("❌ Uncaught Exception:", err?.message || err);
      server.close(() => process.exit(1));
    });
  } catch (e: any) {
    console.error("❌ Failed to start server:", e?.message || e);
    process.exit(1);
  }
})();
