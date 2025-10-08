"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/routes/auth.ts
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");
const AuthRoute = express_1.default.Router();
AuthRoute.post("/login", AuthController_1.login);
AuthRoute.post("/refresh", AuthController_1.refresh);
AuthRoute.post("/signup", AuthController_1.signup);
exports.default = AuthRoute;
//# sourceMappingURL=auth.js.map