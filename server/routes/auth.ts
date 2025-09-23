// server/routes/auth.ts
import express from "express"
import { login, refresh, signup } from "../controllers/AuthController"
const AuthRoute = express.Router();

AuthRoute.post("/login", login);
AuthRoute.post("/refresh", refresh);
AuthRoute.post("/signup", signup);

export default AuthRoute;
