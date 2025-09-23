// server/routes/patient.ts

import express from "express";
import { authorizedPermission } from "../middlewares/authorizedPermission";
import { listPatients, getPatient, createPatient, updatePatient, deletePatient } from "../controllers/PatientController";

const PatientRoute = express.Router();

PatientRoute.get("/", authorizedPermission(["AFFICHER_LIST"], "PATIENTS"), listPatients);
PatientRoute.get("/:id", authorizedPermission(["AFFICHER"], "PATIENTS"), getPatient);
PatientRoute.post("/", authorizedPermission(["AJOUTER"], "PATIENTS"), createPatient);
PatientRoute.put("/:id", authorizedPermission(["MODIFIER"], "PATIENTS"), updatePatient);
PatientRoute.delete("/:id", authorizedPermission(["SUPPRIMER"], "PATIENTS"), deletePatient);

// authorizedPermission(["AFFICHER", "AFFICHER_LIST"], "PATIENTS"),
// authorizedPermission(["AJOUTER"], "PATIENTS"),
// authorizedPermission(["MODIFIER"], "PATIENTS"),
// authorizedPermission(["SUPPRIMER"], "PATIENTS"),

export default PatientRoute;
