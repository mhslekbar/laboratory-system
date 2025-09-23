"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOneImage = void 0;
// server/middlewares/multerUploads.ts
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const PUBLIC_DIR = path_1.default.resolve(process.cwd(), "public");
const UPLOADS_ROOT = path_1.default.join(PUBLIC_DIR, "uploads");
// stockage disque + dossier dynamique par query ?folder=x
const storage = multer_1.default.diskStorage({
    destination: (req, _file, cb) => {
        const raw = String(req.query.folder || "general");
        // whitelisting très simple, optionnel
        const safeFolder = raw.replace(/[^a-z0-9_\-\/]/gi, "");
        const dir = path_1.default.join(UPLOADS_ROOT, safeFolder);
        fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        // nom très simple: timestamp + original ext
        const ext = path_1.default.extname(file.originalname || "").toLowerCase();
        const base = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
        cb(null, base + ext);
    },
});
exports.uploadOneImage = (0, multer_1.default)({
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
