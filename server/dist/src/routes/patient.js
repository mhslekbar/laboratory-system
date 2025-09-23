"use strict";
// server/routes/patient.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authorizedPermission_1 = require("../middlewares/authorizedPermission");
const PatientController_1 = require("../controllers/PatientController");
const PatientRoute = express_1.default.Router();
PatientRoute.get("/", (0, authorizedPermission_1.authorizedPermission)(["AFFICHER_LIST"], "PATIENTS"), PatientController_1.listPatients);
PatientRoute.get("/:id", (0, authorizedPermission_1.authorizedPermission)(["AFFICHER"], "PATIENTS"), PatientController_1.getPatient);
PatientRoute.post("/", (0, authorizedPermission_1.authorizedPermission)(["AJOUTER"], "PATIENTS"), PatientController_1.createPatient);
PatientRoute.put("/:id", (0, authorizedPermission_1.authorizedPermission)(["MODIFIER"], "PATIENTS"), PatientController_1.updatePatient);
PatientRoute.delete("/:id", (0, authorizedPermission_1.authorizedPermission)(["SUPPRIMER"], "PATIENTS"), PatientController_1.deletePatient);
// authorizedPermission(["AFFICHER", "AFFICHER_LIST"], "PATIENTS"),
// authorizedPermission(["AJOUTER"], "PATIENTS"),
// authorizedPermission(["MODIFIER"], "PATIENTS"),
// authorizedPermission(["SUPPRIMER"], "PATIENTS"),
exports.default = PatientRoute;
