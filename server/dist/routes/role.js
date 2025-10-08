"use strict";
// server/routes/role.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RoleRoute = express_1.default.Router();
const RoleController_1 = require("../controllers/RoleController");
const authorizedPermission_1 = require("../middlewares/authorizedPermission");
RoleRoute.get('/', (0, authorizedPermission_1.authorizedPermission)(["AFFICHER", "AFFICHER_LIST"], "ROLES"), RoleController_1.getRoles);
RoleRoute.post('/', (0, authorizedPermission_1.authorizedPermission)(["AJOUTER"], "ROLES"), RoleController_1.createRole);
RoleRoute.put('/:id', (0, authorizedPermission_1.authorizedPermission)(["MODIFIER"], "ROLES"), RoleController_1.updateRole);
RoleRoute.delete('/:id', (0, authorizedPermission_1.authorizedPermission)(["SUPPRIMER"], "ROLES"), RoleController_1.deleteRole);
// authorizedPermission(["AFFICHER", "AFFICHER_LIST"], "ROLES"),
// authorizedPermission(["AJOUTER"], "ROLES"),
// authorizedPermission(["MODIFIER"], "ROLES"),
// authorizedPermission(["SUPPRIMER"], "ROLES"),
exports.default = RoleRoute;
//# sourceMappingURL=role.js.map