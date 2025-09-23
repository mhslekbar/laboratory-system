"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoles = void 0;
const mongoose_1 = require("mongoose");
const RoleModel_1 = __importDefault(require("../models/RoleModel"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// GET /roles
const getRoles = async (_req, res) => {
    try {
        const roles = await RoleModel_1.default.find({})
            .populate({ path: "permissions", model: "permission" })
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json({ success: roles });
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.getRoles = getRoles;
// POST /roles
const createRole = async (req, res) => {
    try {
        let { name = "", permissions = [] } = req.body;
        name = name.trim();
        const errors = [];
        if (!name)
            errors.push("Le nom du rôle est obligatoire");
        if (name.length < 3)
            errors.push("Le nom du rôle doit contenir au moins 3 caractères");
        if (errors.length)
            return res.status(300).json(errors);
        // فحص تكرار الاسم (غير حساس لحالة الأحرف)
        const duplicate = await RoleModel_1.default.findOne({
            name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
        });
        if (duplicate)
            return res.status(300).json(["Le nom existe déjà"]);
        // تأكد من أن permissions مصفوفة ObjectId صالحة
        const permIds = Array.isArray(permissions)
            ? permissions.filter((id) => mongoose_1.Types.ObjectId.isValid(id)).map((id) => new mongoose_1.Types.ObjectId(id))
            : [];
        const created = await RoleModel_1.default.create({ name, permissions: permIds });
        const populated = await RoleModel_1.default.findById(created._id)
            .populate({ path: "permissions", model: "permission" });
        await (0, exports.getRoles)(req, res);
    }
    catch (err) {
        if (err?.code === 11000)
            return res.status(300).json(["Le nom existe déjà"]);
        return res.status(500).json({ err: err.message });
    }
};
exports.createRole = createRole;
// PUT /roles/:id
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return res.status(400).json({ errors: ["ID invalide"] });
        const original = await RoleModel_1.default.findById(id);
        if (!original)
            return res.status(404).json({ errors: ["Rôle introuvable"] });
        let { name = "", permissions } = req.body;
        name = (name ?? "").trim() || original.name;
        const errors = [];
        if (!name)
            errors.push("Le nom du rôle est obligatoire");
        if (name.length < 3)
            errors.push("Le nom du rôle doit contenir au moins 3 caractères");
        if (errors.length)
            return res.status(300).json(errors);
        // منع تكرار الاسم على أدوار أخرى (case-insensitive)
        const exists = await RoleModel_1.default.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
        });
        if (exists)
            return res.status(300).json(["Le nom existe déjà"]);
        let permIds = undefined;
        if (permissions !== undefined) {
            permIds = Array.isArray(permissions)
                ? permissions.filter((p) => mongoose_1.Types.ObjectId.isValid(p)).map((p) => new mongoose_1.Types.ObjectId(p))
                : [];
        }
        await RoleModel_1.default.updateOne({ _id: id }, { $set: { name, ...(permIds ? { permissions: permIds } : {}) } });
        const updated = await RoleModel_1.default.findById(id)
            .populate({ path: "permissions", model: "permission" });
        await (0, exports.getRoles)(req, res);
    }
    catch (err) {
        if (err?.code === 11000)
            return res.status(300).json(["Le nom existe déjà"]);
        return res.status(500).json({ err: err.message });
    }
};
exports.updateRole = updateRole;
// DELETE /roles/:id
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return res.status(300).json(["ID invalide"]);
        // أزل الدور من جميع المستخدمين بكود واحد (بدل map + await داخلها)
        await UserModel_1.default.updateMany({ roles: id }, { $pull: { roles: id } });
        await RoleModel_1.default.deleteOne({ _id: id });
        await (0, exports.getRoles)(req, res);
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.deleteRole = deleteRole;
