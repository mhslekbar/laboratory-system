"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
// Helpers JWT
const signAccessToken = (userId) => jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SEC);
const signRefreshToken = (userId) => jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_REFRESH_SEC, { expiresIn: "7d" });
const sanitizeUser = (userDoc) => {
    const obj = userDoc?.toObject ? userDoc.toObject() : { ...userDoc };
    delete obj.passwordHash;
    delete obj.password;
    delete obj.__v;
    return obj;
};
// POST /api/auth/signup
const signup = async (req, res) => {
    try {
        const { username, password, fullName, phone, email, roles, doctor } = req.body;
        const errors = [];
        if (!fullName?.trim())
            errors.push("Le nom est obligatoire");
        if (!username?.trim())
            errors.push("Le nom d'utilisateur est obligatoire");
        if (!password?.trim())
            errors.push("Le mot de passe est obligatoire");
        if (errors.length)
            return res.status(400).json({ errors });
        const username_lc = username.toLowerCase();
        const exists = await UserModel_1.default.findOne({ username_lc });
        if (exists)
            return res.status(409).json({ errors: ["Le nom d'utilisateur existe déjà"] });
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await UserModel_1.default.create({
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
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.signup = signup;
// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await UserModel_1.default.findOne({
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
            return res.status(300).json({ formErrors: ["Identifiants invalides"] });
        }
        const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(300).json({ formErrors: ["Identifiants invalides"] });
        }
        console.log("User logged in: ", user);
        const accessToken = signAccessToken(user._id?.toString());
        const refreshToken = signRefreshToken(user._id?.toString());
        // Récup des rôles & permissions (optionnel mais pratique côté front)
        const roleNames = [];
        const perms = new Set();
        for (const r of user.roles) {
            roleNames.push(r.name);
            for (const p of (r.permissions || []))
                perms.add(p.key);
        }
        const userData = sanitizeUser(user);
        const userPayload = { ...userData, accessToken, refreshToken };
        return res.status(200).json({
            success: userPayload
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ err: err.message });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(300).json(["Refresh token manquant"]);
        }
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SEC);
        }
        catch (e) {
            // expired / invalid refresh → force re-login
            return res.status(300).json(["Refresh token invalide"]);
        }
        const user = await UserModel_1.default.findById(payload.id ?? payload.sub ?? payload.userId);
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
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.refresh = refresh;
//# sourceMappingURL=AuthController.js.map