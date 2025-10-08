"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizedPermission = void 0;
const UserModel_1 = __importDefault(require("../models/UserModel"));
/**
 * Vérifie que l'utilisateur a AU MOINS UNE des permissions requises
 * sur une collection donnée.
 *
 * @param requiredPerms  ex: ["create", "update"]   (noms de permissions)
 * @param collection     ex: "patients"            (collectionName)
 */
const authorizedPermission = (requiredPerms = [], collection) => {
    return async (req, res, next) => {
        try {
            // 1) présence utilisateur (via verifyToken)
            const uid = req.user?._id;
            if (!uid) {
                return res.status(300).json("Unauthorized");
            }
            // 2) charger rôles + permissions en un seul populate
            const user = await UserModel_1.default.findById(uid)
                .populate({
                path: "roles",
                populate: { path: "permissions", model: "permission", select: "name collectionName" }
            })
                .lean();
            if (!user) {
                return res.status(300).json("Unauthorized");
            }
            // 3) normaliser les comparaisons
            const wantNames = new Set(requiredPerms.map((x) => String(x).trim().toLowerCase()));
            const wantCollection = String(collection || "").trim().toLowerCase();
            // 4) construire un Set des permissions de l'utilisateur
            //    (name + collectionName)
            const userPerms = new Set();
            for (const role of user.roles || []) {
                for (const p of role.permissions || []) {
                    const name = String(p.name || "").toLowerCase();
                    const coll = String(p.collectionName || "").toLowerCase();
                    userPerms.add(`${coll}:${name}`);
                }
            }
            // 5) tester si une des permissions demandées est présente
            let hasPermission = false;
            for (const n of wantNames) {
                if (userPerms.has(`${wantCollection}:${n}`)) {
                    hasPermission = true;
                    break;
                }
            }
            if (!hasPermission) {
                const verb = requiredPerms[0] ? requiredPerms[0].toLowerCase() : "opération";
                const coll = wantCollection || "ressource";
                return res.status(300).json(`Vous n'êtes pas autorisé à ${verb} ${coll}`);
            }
            return next();
        }
        catch (err) {
            return res.status(500).json({ err: err.message || "Internal error" });
        }
    };
};
exports.authorizedPermission = authorizedPermission;
//# sourceMappingURL=authorizedPermission.js.map