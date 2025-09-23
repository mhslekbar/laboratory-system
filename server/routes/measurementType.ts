// server/routes/measurement-type.ts
import express from "express";
import mongoose from "mongoose";
import {
  listMeasurementTypes,
  createMeasurementType,
  updateMeasurementType,
  deleteMeasurementType,
  addStage,
  updateStage,
  removeStage,
} from "../controllers/MeasurementTypeController";

// Adapte les chemins si besoin
import { verifyToken } from "../middlewares/verifyToken";
import { authorizedPermission } from "../middlewares/authorizedPermission";

const router = express.Router();

/* ---------- Param validators ---------- */
router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "ID de type invalide." });
  }
  next();
});

/* ---------- CRUD Measurement Types ---------- */

// List
router.get(
  "/",
  verifyToken,
  authorizedPermission(["AFFICHER", "AFFICHER_LIST"], "TYPES"),
  listMeasurementTypes
);

// Create
router.post(
  "/",
  verifyToken,
  authorizedPermission(["AJOUTER"], "TYPES"),
  createMeasurementType
);

// Update
router.put(
  "/:id",
  verifyToken,
  authorizedPermission(["MODIFIER"], "TYPES"),
  updateMeasurementType
);

// Delete
router.delete(
  "/:id",
  verifyToken,
  authorizedPermission(["SUPPRIMER"], "TYPES"),
  deleteMeasurementType
);

/* ---------- Stages ciblés ---------- */
// Add stage
router.post(
  "/:id/stages",
  verifyToken,
  authorizedPermission(["AJOUTER_ETAPE"], "TYPES"),
  addStage
);

// Update single stage
router.put(
  "/:id/stages/:stageKey",
  verifyToken,
  authorizedPermission(["MODIFIER_ETAPE"], "TYPES"),
  updateStage
);

// Remove single stage
router.delete(
  "/:id/stages/:stageKey",
  verifyToken,
  authorizedPermission(["SUPPRIMER_ETAPE"], "TYPES"),
  removeStage
);

export default router;

/*
ACL utilisées :
- ["AFFICHER", "AFFICHER_LIST"] pour GET /
- ["AJOUTER"] pour POST /
- ["MODIFIER"] pour PUT /:id et routes stages
- ["SUPPRIMER"] pour DELETE /:id
*/
