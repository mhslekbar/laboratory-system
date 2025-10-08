"use strict";
// server/middlwares/verifyToken.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
/**
 * Politique Option B :
 * - On garde le statut HTTP 403 côté serveur.
 * - Quand le problème est lié à l’authentification expirée/absente, on renvoie
 *   un body explicite { error: "TOKEN_EXPIRED", ... } pour que le front déclenche le refresh.
 * - 403 ["Token invalide"] reste pour les vrais tokens invalides (signature/forme).
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // Pas d’en-tête Authorization → on signale au client de tenter un refresh
        if (!authHeader) {
            return res.status(403).json({ error: "TOKEN_EXPIRED", reason: "NO_AUTH_HEADER" });
        }
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        // Token public pour certaines routes
        if (token === "public")
            return next();
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SEC ?? "");
        }
        catch (e) {
            // Token JWT expiré → 403 + marqueur explicite
            if (e?.name === "TokenExpiredError") {
                return res.status(403).json({ error: "TOKEN_EXPIRED", expiredAt: e?.expiredAt });
            }
            // Autres erreurs (signature invalide, token corrompu, etc.) → interdit “classique”
            return res.status(403).json(["Token invalide"]);
        }
        const user = await UserModel_1.default.findById(decoded.id);
        // Utilisateur non trouvé → on force le client à se ré-authentifier (refresh + éventuellement relogin)
        if (!user) {
            return res.status(403).json({ error: "TOKEN_EXPIRED", reason: "USER_NOT_FOUND" });
        }
        req.user = user;
        next();
    }
    catch (err) {
        // Erreur inattendue côté serveur
        return res.status(500).json(["Erreur serveur auth"]);
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=verifyToken.js.map