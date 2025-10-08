// server/controllers/AuthController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel";

// Helpers JWT
const signAccessToken = (userId: string) =>
  jwt.sign({ id: userId }, process.env.JWT_SEC!);

const signRefreshToken = (userId: string) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SEC!, { expiresIn: "7d" });


const sanitizeUser = (userDoc: any) => {
  const obj = userDoc?.toObject ? userDoc.toObject() : { ...userDoc };
  delete obj.passwordHash
  delete obj.password;
  delete obj.__v;
  return obj;
};

// POST /api/auth/signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, phone, email, roles, doctor } = req.body as {
      username: string; password: string; fullName: string;
      phone?: string; email?: string; roles?: string[]; doctor?: any;
    };

    const errors: string[] = [];
    if (!fullName?.trim()) errors.push("Le nom est obligatoire");
    if (!username?.trim()) errors.push("Le nom d'utilisateur est obligatoire");
    if (!password?.trim()) errors.push("Le mot de passe est obligatoire");
    if (errors.length) return res.status(400).json({ errors });

    const username_lc = username.toLowerCase();
    const exists = await UserModel.findOne({ username_lc });
    if (exists) return res.status(409).json({ errors: ["Le nom d'utilisateur existe déjà"] });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      fullName,
      username,
      username_lc,
      passwordHash,
      phone,
      email,
      roles: roles ?? [],
      doctor: doctor ?? undefined,
      active: true
    });

    return res.status(200).json({
      success: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        phone: user.phone,
        email: user.email
      }
    });
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    
    const user = await UserModel.findOne({
      username_lc: String(username || "").toLowerCase(),
      active: true
    })
    
    .populate({
        path: "roles",
        populate: {
          path: "permissions",
          model: "permission",
        },
      });

    if (!user) {
      return res.status(300).json({ formErrors : ["Identifiants invalides"] });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(300).json({ formErrors : ["Identifiants invalides"] });
    }

      console.log("User logged in: ", user);
    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id?.toString());

    // Récup des rôles & permissions (optionnel mais pratique côté front)
    const roleNames: string[] = [];
    const perms = new Set<string>();
    for (const r of (user.roles as any[])) {
      roleNames.push(r.name);
      for (const p of (r.permissions || [])) perms.add(p.key);
    }

    const userData = sanitizeUser(user);
    const userPayload = { ...userData, accessToken, refreshToken };

    return res.status(200).json({
      success: userPayload
    });
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ err: err.message });
  }
};


export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      return res.status(300).json(["Refresh token manquant"]);
    }

    let payload: any;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SEC!);
    } catch (e: any) {
      // expired / invalid refresh → force re-login
      return res.status(300).json(["Refresh token invalide"]);
    }

    const user = await UserModel.findById(payload.id ?? payload.sub ?? payload.userId);
    if (!user || !user.active) {
      return res.status(300).json(["Utilisateur inactif ou introuvable"]);
    }

    const newAccess = signAccessToken(user._id.toString());
    const newRefresh = signRefreshToken(user._id.toString());

    return res.status(200).json({
      success: {
        accessToken: newAccess,
        refreshToken: newRefresh,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};