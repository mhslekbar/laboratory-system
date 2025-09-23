// server/routes/permission.ts

import express from "express"
const PermissionRoute = express.Router();
import { getPermissions, getPermissionsByTable, createPermission, updatePermission, deletePermission, createManyPermission, deleteAllPermission } from "../controllers/PermissionController";

PermissionRoute.get("/", getPermissions);
PermissionRoute.get("/ByTable", getPermissionsByTable);
PermissionRoute.post("/", createPermission);
PermissionRoute.post("/many", createManyPermission);
PermissionRoute.put("/:id", updatePermission);
PermissionRoute.delete("/:id", deletePermission);
PermissionRoute.delete("/", deleteAllPermission);

export default PermissionRoute;
