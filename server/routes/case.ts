// server/routes/case.ts
import express from "express";
import mongoose from "mongoose";
import {
  listCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  advanceStage,
  setStageStatus,
  setDeliveryStatus,
  approveCase,
  addAttachment,
  removeAttachment,
} from "../controllers/CaseController";

// Adapte les chemins si besoin
import { verifyToken } from "../middlewares/verifyToken";
import { authorizedPermission } from "../middlewares/authorizedPermission";

const CaseRoute = express.Router();

/* --------- Validators de params --------- */
CaseRoute.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "ID de dossier invalide." });
  }
  next();
});

CaseRoute.param("attachmentId", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "ID de pièce jointe invalide." });
  }
  next();
});

/* --------- Routes --------- */

// Liste
CaseRoute.get(
  "/",
  verifyToken,
  authorizedPermission(["AFFICHER", "AFFICHER_LIST"], "DOSSIERS"),
  listCases
);

// Détail
CaseRoute.get(
  "/:id",
  verifyToken,
  authorizedPermission(["AFFICHER"], "DOSSIERS"),
  getCaseById
);

// Création
CaseRoute.post(
  "/",
  verifyToken,
  authorizedPermission(["AJOUTER"], "DOSSIERS"),
  createCase
);

// Mise à jour (choisis la permission qui convient dans ton système, ex: "MODIFIER")
CaseRoute.put(
  "/:id",
  verifyToken,
  authorizedPermission(["MODIFIER"], "DOSSIERS"),
  updateCase
);

// Suppression (si tu as "SUPPRIMER" dans ton ACL, dé-commente)
CaseRoute.delete(
  "/:id",
  verifyToken,
  authorizedPermission(["SUPPRIMER"], "DOSSIERS"),
  deleteCase
);

/* --------- Workflow --------- */

// Avancer/revenir à une étape donnée
CaseRoute.post(
  "/:id/advance",
  verifyToken,
  authorizedPermission(["AVANCER"], "DOSSIERS"),
  advanceStage
);

// Changer uniquement le statut d’une étape
CaseRoute.post(
  "/:id/stages/:stageKey/status",
  verifyToken,
  authorizedPermission(["AVANCER"], "DOSSIERS"),
  setStageStatus
);

// Statut de livraison (ex: prêt)
CaseRoute.post(
  "/:id/delivery",
  verifyToken,
  authorizedPermission(["PRET"], "DOSSIERS"),
  setDeliveryStatus
);

// Approbation (تم الاستلام)
CaseRoute.post(
  "/:id/approve",
  verifyToken,
  authorizedPermission(["APPROUVER"], "DOSSIERS"),
  approveCase
);

/* --------- Pièces jointes --------- */

CaseRoute.post(
  "/:id/attachments",
  verifyToken,
  authorizedPermission(["AJOUTER_PJ"], "DOSSIERS"),
  addAttachment
);

CaseRoute.delete(
  "/:id/attachments/:attachmentId",
  verifyToken,
  authorizedPermission(["SUPPRIMER_PJ"], "DOSSIERS"),
  removeAttachment
);

export default CaseRoute;

/*
Dispos dans ton ACL d’après tes commentaires :
- authorizedPermission(["AFFICHER", "AFFICHER_LIST"], "DOSSIERS"),
- authorizedPermission(["AFFICHER"], "DOSSIERS"),
- authorizedPermission(["AJOUTER"], "DOSSIERS"),
- authorizedPermission(["AVANCER"], "DOSSIERS"),
- authorizedPermission(["PRET"], "DOSSIERS"),
- authorizedPermission(["APPROUVER"], "DOSSIERS"),
- authorizedPermission(["AJOUTER_PJ"], "DOSSIERS"),
- authorizedPermission(["SUPPRIMER_PJ"], "DOSSIERS"),

Pour PUT/DELETE, remplace par tes clés réelles (ex: "MODIFIER", "SUPPRIMER") si elles existent.
*/
