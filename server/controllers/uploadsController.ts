// server/controllers/UploadController.ts
import type { Request, Response } from "express";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

/** Répertoire racine où sont stockés les uploads (exposé statiquement par Express) */
const PUBLIC_DIR = path.resolve(process.cwd(), "public"); // adapte si besoin
const UPLOADS_ROOT = path.join(PUBLIC_DIR, "uploads");

/** Empêche les traversals, force un chemin dans /public/uploads */
function safeJoinUploads(relPath: string) {
  // retire éventuels prefix d’URL absolue / querystrings
  const clean = relPath.replace(/^https?:\/\/[^/]+/i, "").split("?")[0];
  const p = path.normalize(path.join(UPLOADS_ROOT, clean.replace(/^\/+/, "")));
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
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const folder = String(req.query.folder || "general");
    const prevUrl =
      (typeof req.query.prevUrl === "string" && req.query.prevUrl) ||
      (typeof (req.body?.prevUrl) === "string" && req.body.prevUrl) ||
      (req.headers["x-prev-url"] as string | undefined);

    if (!file) {
      return res.status(400).json({ err: "Aucun fichier" });
    }

    // L’URL publique (relative) du nouveau fichier (ex: "uploads/logos/abc123.png")
    const url = `uploads/${folder}/${file.filename}`;

    // Supprimer l’ancienne image si fournie et dans /uploads
    let deleted: string | undefined;
    if (prevUrl && /^uploads\//.test(prevUrl)) {
      try {
        const full = safeJoinUploads(prevUrl);
        if (fs.existsSync(full)) {
          await fsp.unlink(full);
          deleted = prevUrl;
        }
      } catch (e) {
        // on ignore silencieusement (ex: fichier déjà supprimé ou chemin invalide)
      }
    }

    return res.json({ success: { url} });
    // return res.json({ success: { url, ...(deleted ? { deleted } : {}) } });
  } catch (err: any) {
    return res.status(500).json({ err: err.message || "Upload échoué" });
  }
};
