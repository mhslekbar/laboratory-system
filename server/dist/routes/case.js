"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/routes/case.ts
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const CaseController_1 = require("../controllers/CaseController");
// Adapte les chemins si besoin
const verifyToken_1 = require("../middlewares/verifyToken");
const authorizedPermission_1 = require("../middlewares/authorizedPermission");
const CaseRoute = express_1.default.Router();
/* --------- Validators de params --------- */
CaseRoute.param("id", (req, res, next, id) => {
    if (!mongoose_1.default.isValidObjectId(id)) {
        return res.status(400).json({ error: "ID de dossier invalide." });
    }
    next();
});
CaseRoute.param("attachmentId", (req, res, next, id) => {
    if (!mongoose_1.default.isValidObjectId(id)) {
        return res.status(400).json({ error: "ID de pièce jointe invalide." });
    }
    next();
});
/* --------- Routes --------- */
// Liste
CaseRoute.get("/", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["AFFICHER", "AFFICHER_LIST"], "DOSSIERS"), CaseController_1.listCases);
// Détail
CaseRoute.get("/:id", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["AFFICHER"], "DOSSIERS"), CaseController_1.getCaseById);
// Création
CaseRoute.post("/", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["AJOUTER"], "DOSSIERS"), CaseController_1.createCase);
// Mise à jour (choisis la permission qui convient dans ton système, ex: "MODIFIER")
CaseRoute.put("/:id", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["MODIFIER"], "DOSSIERS"), CaseController_1.updateCase);
// Suppression (si tu as "SUPPRIMER" dans ton ACL, dé-commente)
CaseRoute.delete("/:id", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["SUPPRIMER"], "DOSSIERS"), CaseController_1.deleteCase);
/* --------- Workflow --------- */
// Avancer/revenir à une étape donnée
CaseRoute.post("/:id/advance", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["AVANCER"], "DOSSIERS"), CaseController_1.advanceStage);
// Changer uniquement le statut d’une étape
CaseRoute.post("/:id/stages/:stageKey/status", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["AVANCER"], "DOSSIERS"), CaseController_1.setStageStatus);
// Statut de livraison (ex: prêt)
CaseRoute.post("/:id/delivery", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["PRET"], "DOSSIERS"), CaseController_1.setDeliveryStatus);
// Approbation (تم الاستلام)
CaseRoute.post("/:id/approve", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["APPROUVER"], "DOSSIERS"), CaseController_1.approveCase);
/* --------- Pièces jointes --------- */
CaseRoute.post("/:id/attachments", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["AJOUTER_PJ"], "DOSSIERS"), CaseController_1.addAttachment);
CaseRoute.delete("/:id/attachments/:attachmentId", verifyToken_1.verifyToken, (0, authorizedPermission_1.authorizedPermission)(["SUPPRIMER_PJ"], "DOSSIERS"), CaseController_1.removeAttachment);
exports.default = CaseRoute;
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
//# sourceMappingURL=case.js.map