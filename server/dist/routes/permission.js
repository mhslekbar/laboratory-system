"use strict";
// server/routes/permission.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PermissionRoute = express_1.default.Router();
const PermissionController_1 = require("../controllers/PermissionController");
PermissionRoute.get("/", PermissionController_1.getPermissions);
PermissionRoute.get("/ByTable", PermissionController_1.getPermissionsByTable);
PermissionRoute.post("/", PermissionController_1.createPermission);
PermissionRoute.post("/many", PermissionController_1.createManyPermission);
PermissionRoute.put("/:id", PermissionController_1.updatePermission);
PermissionRoute.delete("/:id", PermissionController_1.deletePermission);
PermissionRoute.delete("/", PermissionController_1.deleteAllPermission);
exports.default = PermissionRoute;
