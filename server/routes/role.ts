// server/routes/role.ts

import express from "express"
const RoleRoute = express.Router()
import { getRoles, createRole, updateRole, deleteRole } from "../controllers/RoleController"
import { authorizedPermission } from "../middlewares/authorizedPermission";

RoleRoute.get('/',  authorizedPermission(["AFFICHER", "AFFICHER_LIST"], "ROLES"), getRoles);
RoleRoute.post('/',  authorizedPermission(["AJOUTER"], "ROLES"), createRole);
RoleRoute.put('/:id', authorizedPermission(["MODIFIER"], "ROLES"), updateRole);
RoleRoute.delete('/:id', authorizedPermission(["SUPPRIMER"], "ROLES"), deleteRole);

// authorizedPermission(["AFFICHER", "AFFICHER_LIST"], "ROLES"),
// authorizedPermission(["AJOUTER"], "ROLES"),
// authorizedPermission(["MODIFIER"], "ROLES"),
// authorizedPermission(["SUPPRIMER"], "ROLES"),

export default RoleRoute;