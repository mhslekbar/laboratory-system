// server/routes/todoRoutes.ts
import { Router } from "express";
import { listTodos, createTodo, updateTodo, deleteTodo } from "../controllers/TodoController";
// import { requireAuth } from "../middleware/requireAuth"; // si tu as un middleware d’auth

const TodoRoute = Router();

// TodoRoute.use(requireAuth);

TodoRoute.get("/", listTodos);
TodoRoute.post("/", createTodo);
TodoRoute.put("/:id", updateTodo);
TodoRoute.delete("/:id", deleteTodo);

export default TodoRoute;
