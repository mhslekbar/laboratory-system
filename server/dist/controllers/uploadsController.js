"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
/** Répertoire racine où sont stockés les uploads (exposé statiquement par Express) */
const PUBLIC_DIR = path_1.default.resolve(process.cwd(), "public"); // adapte si besoin
const UPLOADS_ROOT = path_1.default.join(PUBLIC_DIR, "uploads");
/** Empêche les traversals, force un chemin dans /public/uploads */
function safeJoinUploads(relPath) {
    // retire éventuels prefix d’URL absolue / querystrings
    const clean = relPath.replace(/^https?:\/\/[^/]+/i, "").split("?")[0];
    const p = path_1.default.normalize(path_1.default.join(UPLOADS_ROOT, clean.replace(/^\/+/, "")));
    if (!p.startsWith(UPLOADS_ROOT)) {
        throw new Error("Chemin de fichier invalide.");
    }
    return p;
}
/**
 * POST /uploads/image?folder=logos
 *  - body form-data: file (Multer single)
 *  - optional: prevUrl (query | body) : "uploads/xxx/old.png"
 * Réponse: { success: { url: "uploads/xxx/new.png", deleted?: string } }
 */
const uploadImage = async (req, res) => {
    try {
        const file = req.file;
        const folder = String(req.query.folder || "general");
        const prevUrl = (typeof req.query.prevUrl === "string" && req.query.prevUrl) ||
            (typeof (req.body?.prevUrl) === "string" && req.body.prevUrl) ||
            req.headers["x-prev-url"];
        if (!file) {
            return res.status(400).json({ err: "Aucun fichier" });
        }
        // L’URL publique (relative) du nouveau fichier (ex: "uploads/logos/abc123.png")
        const url = `uploads/${folder}/${file.filename}`;
        // Supprimer l’ancienne image si fournie et dans /uploads
        let deleted;
        if (prevUrl && /^uploads\//.test(prevUrl)) {
            try {
                const full = safeJoinUploads(prevUrl);
                if (fs_1.default.existsSync(full)) {
                    await promises_1.default.unlink(full);
                    deleted = prevUrl;
                }
            }
            catch (e) {
                // on ignore silencieusement (ex: fichier déjà supprimé ou chemin invalide)
            }
        }
        return res.json({ success: { url } });
        // return res.json({ success: { url, ...(deleted ? { deleted } : {}) } });
    }
    catch (err) {
        return res.status(500).json({ err: err.message || "Upload échoué" });
    }
};
exports.uploadImage = uploadImage;
//# sourceMappingURL=uploadsController.js.map