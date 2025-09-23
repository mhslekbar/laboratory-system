// server/middlewares/multerUploads.ts
import multer from "multer";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const UPLOADS_ROOT = path.join(PUBLIC_DIR, "uploads");

// stockage disque + dossier dynamique par query ?folder=x
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const raw = String(req.query.folder || "general");
    // whitelisting très simple, optionnel
    const safeFolder = raw.replace(/[^a-z0-9_\-\/]/gi, "");
    const dir = path.join(UPLOADS_ROOT, safeFolder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    // nom très simple: timestamp + original ext
    const ext = path.extname(file.originalname || "").toLowerCase();
    const base = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    cb(null, base + ext);
  },
});

export const uploadOneImage = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    // Filtre images
    if (!/^image\//i.test(file.mimetype)) {
      return cb(new Error("Type de fichier non supporté"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB (adapte)
  },
}).single("file");
