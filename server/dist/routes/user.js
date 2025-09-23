"use strict";
// server/routes/user.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserRoute = express_1.default.Router();
const UserController_1 = require("../controllers/UserController");
const authorizedPermission_1 = require("../middlewares/authorizedPermission");
UserRoute.get("/", (0, authorizedPermission_1.authorizedPermission)(["AFFICHER", "AFFICHER_LIST"], "UTILISATEURS"), UserController_1.getUsers);
UserRoute.get("/doctors", (0, authorizedPermission_1.authorizedPermission)(["AFFICHER"], "MEDECINS"), UserController_1.listDoctors);
UserRoute.post("/", (0, authorizedPermission_1.authorizedPermission)(["AJOUTER"], "UTILISATEURS"), UserController_1.insertUser);
UserRoute.put("/:id", (0, authorizedPermission_1.authorizedPermission)(["MODIFIER"], "UTILISATEURS"), UserController_1.updateUser);
UserRoute.delete("/:id", (0, authorizedPermission_1.authorizedPermission)(["SUPPRIMER"], "UTILISATEURS"), UserController_1.deleteUser);
// authorizedPermission(["AFFICHER", "AFFICHER_LIST"], "UTILISATEURS"),
// authorizedPermission(["AJOUTER"], "UTILISATEURS"),
// authorizedPermission(["MODIFIER"], "UTILISATEURS"),
// authorizedPermission(["SUPPRIMER"], "UTILISATEURS"),
exports.default = UserRoute;
