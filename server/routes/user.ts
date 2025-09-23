// server/routes/user.ts

import express from "express"
const UserRoute = express.Router();
import { getUsers , insertUser, updateUser, deleteUser, listDoctors } from "../controllers/UserController"
import { authorizedPermission } from "../middlewares/authorizedPermission";

UserRoute.get("/" , authorizedPermission(["AFFICHER", "AFFICHER_LIST"], "UTILISATEURS"), getUsers);
UserRoute.get("/doctors", authorizedPermission(["AFFICHER"], "MEDECINS"), listDoctors);
UserRoute.post("/" , authorizedPermission(["AJOUTER"], "UTILISATEURS"), insertUser);
UserRoute.put("/:id" ,authorizedPermission(["MODIFIER"], "UTILISATEURS"),  updateUser);
UserRoute.delete("/:id" , authorizedPermission(["SUPPRIMER"], "UTILISATEURS"), deleteUser);

// authorizedPermission(["AFFICHER", "AFFICHER_LIST"], "UTILISATEURS"),
// authorizedPermission(["AJOUTER"], "UTILISATEURS"),
// authorizedPermission(["MODIFIER"], "UTILISATEURS"),
// authorizedPermission(["SUPPRIMER"], "UTILISATEURS"),

export default UserRoute;
