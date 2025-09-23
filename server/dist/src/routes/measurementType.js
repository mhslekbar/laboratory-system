"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/routes/measurement-type.ts
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const MeasurementTypeController_1 = require("../controllers/MeasurementTypeController");
// Adapte les chemins si besoin
const verifyToken_1 = require("../middlewares/verifyToken");
const authorizedPermission_1 = require("../middlewares/authorizedPermission");
const router = express_1.default.Router();
/* ---------- Param validators ---------- */
router.param("id", (req, res, next, id) => {
    if (!mongoose_1.default.isValidObjectId(id)) {
        return res.status(400).json({ error: "ID de type invalide." });
    }
    next();
});
/* ---------- CRUD Measurement Types ---------- */
// List
router.get("/", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["AFFICHER", "AFFICHER_LIST"], "TYPES"), MeasurementTypeController_1.listMeasurementTypes);
// Create
router.post("/", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["AJOUTER"], "TYPES"), MeasurementTypeController_1.createMeasurementType);
// Update
router.put("/:id", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["MODIFIER"], "TYPES"), MeasurementTypeController_1.updateMeasurementType);
// Delete
router.delete("/:id", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["SUPPRIMER"], "TYPES"), MeasurementTypeController_1.deleteMeasurementType);
/* ---------- Stages ciblés ---------- */
// Add stage
router.post("/:id/stages", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["AJOUTER_ETAPE"], "TYPES"), MeasurementTypeController_1.addStage);
// Update single stage
router.put("/:id/stages/:stageKey", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["MODIFIER_ETAPE"], "TYPES"), MeasurementTypeController_1.updateStage);
// Remove single stage
router.delete("/:id/stages/:stageKey", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["SUPPRIMER_ETAPE"], "TYPES"), MeasurementTypeController_1.removeStage);
exports.default = router;
/*
ACL utilisées :
- ["AFFICHER", "AFFICHER_LIST"] pour GET /
- ["AJOUTER"] pour POST /
- ["MODIFIER"] pour PUT /:id et routes stages
- ["SUPPRIMER"] pour DELETE /:id
*/
