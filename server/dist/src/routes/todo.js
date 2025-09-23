"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/routes/todoRoutes.ts
const express_1 = require("express");
const TodoController_1 = require("../controllers/TodoController");
// import { requireAuth } from "../middleware/requireAuth"; // si tu as un middleware d’auth
const TodoRoute = (0, express_1.Router)();
// TodoRoute.use(requireAuth);
TodoRoute.get("/", TodoController_1.listTodos);
TodoRoute.post("/", TodoController_1.createTodo);
TodoRoute.put("/:id", TodoController_1.updateTodo);
TodoRoute.delete("/:id", TodoController_1.deleteTodo);
exports.default = TodoRoute;
