// server/middlewares/authorizedPermission.ts
import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import UserModel from "../models/UserModel";
import { AuthRequest } from "./verifyToken";

/**
 * Vérifie que l'utilisateur a AU MOINS UNE des permissions requises
 * sur une collection donnée.
 *
 * @param requiredPerms  ex: ["create", "update"]   (noms de permissions)
 * @param collection     ex: "patients"            (collectionName)
 */
export const authorizedPermission = (
  requiredPerms: string[] = [],
  collection: string
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      
      // 1) présence utilisateur (via verifyToken)
      const uid: Types.ObjectId | undefined = req.user?._id as any;
      if (!uid) {

        return res.status(300).json("Unauthorized");
      }

      // 2) charger rôles + permissions en un seul populate
      const user = await UserModel.findById(uid)
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
      const userPerms = new Set<string>();
      for (const role of (user.roles as any[]) || []) {
        for (const p of (role.permissions as any[]) || []) {
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
    } catch (err: any) {
      return res.status(500).json({ err: err.message || "Internal error" });
    }
  };
};
