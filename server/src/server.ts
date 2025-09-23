// server/src/server.ts
import { buildApp } from "./app";
import { env } from "./config/env";

(async () => {
  const app = await buildApp();
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
  });
})();
