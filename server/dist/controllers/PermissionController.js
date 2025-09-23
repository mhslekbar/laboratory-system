"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllPermission = exports.deletePermission = exports.updatePermission = exports.createManyPermission = exports.createPermission = exports.getPermissionsByTable = exports.getPermissions = void 0;
const mongoose_1 = require("mongoose");
const PermissionModel_1 = __importDefault(require("../models/PermissionModel"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
/**
 * GET /permissions
 * - بدون userId: يرجّع كل الصلاحيات (أحدث أولاً)
 * - مع userId: يرجّع الصلاحيات الممنوحة للمستخدم (تفريد + ترتيب)
 */
const getPermissions = async (req, res) => {
    try {
        const { userId } = req.query;
        if (userId) {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                return res.status(300).json(["userId غير صالح"]);
            }
            const user = await UserModel_1.default.findById(userId)
                .populate({
                path: "roles",
                populate: { path: "permissions", model: "permission" },
            })
                .lean();
            if (!user) {
                return res.status(300).json(["Utilisateur introuvable"]);
            }
            // تفريد الصلاحيات عبر Set على _id
            const seen = new Set();
            const userPerms = [];
            for (const role of user.roles || []) {
                for (const p of role.permissions || []) {
                    const id = String(p._id);
                    if (!seen.has(id)) {
                        seen.add(id);
                        userPerms.push(p);
                    }
                }
            }
            // ترتيب تنازلياً حسب createdAt
            userPerms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return res.status(200).json({ success: userPerms });
        }
        // بدون userId: كل الصلاحيات
        const all = await PermissionModel_1.default.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: all });
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.getPermissions = getPermissions;
/**
 * GET /permissions/by-table
 * تجميع الصلاحيات حسب collectionName، مع ترتيب داخلي حسب createdAt desc
 */
const getPermissionsByTable = async (req, res) => {
    try {
        const result = await PermissionModel_1.default.aggregate([
            { $sort: { createdAt: -1 } }, // مهم قبل التجميع ليحافظ على الترتيب داخل data
            {
                $group: {
                    _id: "$collectionName",
                    data: { $push: "$$ROOT" },
                },
            },
            { $sort: { _id: 1 } }, // ترتيب المجموعات اختياري
        ]);
        return res.status(200).json({ success: result });
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.getPermissionsByTable = getPermissionsByTable;
/**
 * POST /permissions
 * إنشاء صلاحية واحدة
 */
const createPermission = async (req, res) => {
    try {
        const { name = "", collectionName = "" } = req.body;
        const errors = [];
        if (!name.trim())
            errors.push("Le nom du permission est obligatoire");
        if (!collectionName.trim())
            errors.push("Le nom de la collection est obligatoire");
        if (errors.length)
            return res.status(300).json(errors);
        const exists = await PermissionModel_1.default.findOne({ name, collectionName });
        if (exists) {
            return res.status(300).json(["Le permission existe déjà"]);
        }
        await PermissionModel_1.default.create({ name, collectionName });
        await (0, exports.getPermissions)(req, res);
    }
    catch (err) {
        // احتمال Duplicate key بسبب unique index
        if (err?.code === 11000) {
            return res.status(300).json(["Le permission existe déjà"]);
        }
        return res.status(500).json({ err: err.message });
    }
};
exports.createPermission = createPermission;
/**
 * POST /permissions/bulk
 * إنشاء عدة صلاحيات دفعة واحدة بشكل آمن
 */
const createManyPermission = async (req, res) => {
    try {
        const { permissions = [] } = req.body;
        if (!Array.isArray(permissions) || permissions.length === 0) {
            return res
                .status(300)
                .json({ errors: ["La liste des permissions est vide"] });
        }
        // تنظيف/تحقق بسيط
        const docs = permissions
            .map((p) => ({
            name: String(p.name || "").trim(),
            collectionName: String(p.collectionName || "").trim(),
        }))
            .filter((p) => p.name && p.collectionName);
        if (docs.length === 0) {
            return res
                .status(400)
                .json({ errors: ["Toutes les permissions sont invalides"] });
        }
        // إدراج غير مرتب (يتخطى العناصر المكررة ويكمل)
        const inserted = await PermissionModel_1.default.insertMany(docs, {
            ordered: false,
        }).catch(() => null);
        const all = await PermissionModel_1.default.find().sort({ createdAt: -1 });
        await (0, exports.getPermissions)(req, res);
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.createManyPermission = createManyPermission;
/**
 * PUT /permissions/:id
 * تحديث صلاحية
 */
const updatePermission = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ errors: ["ID invalide"] });
        }
        let { name = "", collectionName = "" } = req.body;
        // اجلب الأصل لاستكمال الحقول الفارغة
        const original = await PermissionModel_1.default.findById(id);
        if (!original) {
            return res.status(404).json({ errors: ["Permission introuvable"] });
        }
        name = name?.trim() || original.name;
        collectionName = collectionName?.trim() || original.collectionName;
        // تحقق من عدم وجود تكرار على سجل آخر
        const duplicate = await PermissionModel_1.default.findOne({
            _id: { $ne: id },
            name,
            collectionName,
        });
        if (duplicate) {
            return res.status(409).json({ errors: ["Le permission existe déjà"] });
        }
        const updated = await PermissionModel_1.default.findByIdAndUpdate(id, { $set: { name, collectionName } }, { new: true });
        await (0, exports.getPermissions)(req, res);
    }
    catch (err) {
        // احتمال Duplicate key
        if (err?.code === 11000) {
            return res.status(409).json({ errors: ["Le permission existe déjà"] });
        }
        return res.status(500).json({ err: err.message });
    }
};
exports.updatePermission = updatePermission;
/**
 * DELETE /permissions/:id
 */
const deletePermission = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ errors: ["ID invalide"] });
        }
        await PermissionModel_1.default.deleteOne({ _id: id });
        await (0, exports.getPermissions)(req, res);
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.deletePermission = deletePermission;
/**
 * DELETE /permissions
 * حذف كل الصلاحيات (استعمل بحذر)
 */
const deleteAllPermission = async (_req, res) => {
    try {
        await PermissionModel_1.default.deleteMany();
        await (0, exports.getPermissions)(_req, res);
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.deleteAllPermission = deleteAllPermission;
