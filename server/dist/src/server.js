"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/server.ts
const app_1 = require("./app");
const env_1 = require("./config/env");
(async () => {
    const app = await (0, app_1.buildApp)();
    app.listen(env_1.env.PORT, () => {
        console.log(`🚀 Server running on port ${env_1.env.PORT}`);
    });
})();
