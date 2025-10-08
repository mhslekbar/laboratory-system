"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDoctors = exports.deleteUser = exports.updateUser = exports.insertUser = exports.getUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
/* ----------------------------- helpers ----------------------------- */
const sanitize = (u) => ({
    _id: u._id,
    fullName: u.fullName,
    username: u.username,
    phone: u.phone,
    email: u.email,
    active: u.active,
    doctor: u.doctor,
    roles: u.roles,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
});
/*
  ملاحظة: نموذجك يستخدم passwordHash بدلاً من password،
  لذلك في الإنشاء/التعديل سنبني/نُحدّث passwordHash (باستخدام bcrypt)
*/
/* ------------------------------- Read ------------------------------ */
// helper pour échapper une regex depuis q
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toPosInt = (v, fallback, max = 100) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), max) : fallback;
};
const getUsers = async (req, res) => {
    try {
        const { q, page: pageRaw, limit: limitRaw } = req.query;
        // 1) Normaliser ONLY (all/users/doctors), insensible à la casse, défaut = 'all'
        const onlyRaw = String(req.query.only ?? "all").toLowerCase();
        const only = onlyRaw === "users" || onlyRaw === "doctors" ? onlyRaw : "all";
        // 2) Construire le filtre via un $and cumulatif (plus sûr)
        const and = [];
        // Texte (q)
        if (q && q.trim()) {
            const rx = new RegExp(escapeRegex(q.trim()), "i");
            and.push({
                $or: [
                    { fullName: rx },
                    { username: rx },
                    { username_lc: rx },
                    { phone: rx },
                    { email: rx },
                ],
            });
        }
        // only = doctors | users | all
        if (only === "doctors") {
            and.push({ "doctor.isDoctor": true });
        }
        else if (only === "users") {
            and.push({
                $or: [
                    { "doctor.isDoctor": { $ne: true } },
                    { doctor: { $exists: false } },
                ],
            });
        }
        // only === "all" => pas de contrainte supplémentaire
        const filter = and.length ? { $and: and } : {};
        // 3) Pagination (optionnelle)
        const hasPagination = pageRaw !== undefined || limitRaw !== undefined;
        if (hasPagination) {
            const page = toPosInt(pageRaw, 1);
            const limit = toPosInt(limitRaw, 10, 100);
            const skip = (page - 1) * limit;
            const [total, items] = await Promise.all([
                UserModel_1.default.countDocuments(filter),
                UserModel_1.default.find(filter, { passwordHash: 0 })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate("roles")
                    .lean(),
            ]);
            const pages = Math.max(1, Math.ceil(total / limit));
            // console.log("items: ", items)
            return res.status(200).json({
                success: {
                    items,
                    total,
                    page,
                    limit,
                    pages,
                    hasNext: page < pages,
                    hasPrev: page > 1,
                },
            });
        }
        // 4) Mode legacy (sans pagination)
        const users = await UserModel_1.default.find(filter, { passwordHash: 0 })
            .sort({ createdAt: -1 })
            .populate("roles")
            .lean();
        return res.status(200).json({ success: users });
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.getUsers = getUsers;
/* ------------------------------ Create ----------------------------- */
const insertUser = async (req, res) => {
    try {
        let { fullName, username, phone, email, password, roles, doctor, active, } = req.body;
        const formErrors = [];
        if (!fullName?.trim())
            formErrors.push("Le nom est obligatoire");
        if (!username?.trim())
            formErrors.push("Le nom d'utilisateur est obligatoire");
        if (!password?.trim())
            password = "1212";
        if ((!roles || (Array.isArray(roles) && roles.length === 0)) && !doctor?.isDoctor)
            formErrors.push("Choisir au moins un groupe");
        if (formErrors.length)
            return res.status(300).json({ formErrors });
        // unicité username (sur username_lc)
        const username_lc = String(username).toLowerCase();
        const exists = await UserModel_1.default.findOne({ username_lc });
        if (exists)
            return res.status(409).json({ formErrors: ["Le nom d'utilisateur existe déjà"] });
        // hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await UserModel_1.default.create({
            fullName: fullName.trim(),
            username: username.trim(),
            username_lc,
            passwordHash,
            phone: phone?.trim(),
            email: email?.trim(),
            roles: roles ?? [],
            doctor: doctor ?? undefined,
            active: typeof active === "boolean" ? active : true,
        });
        // retourner القائمة (مثل منطقك السابق) أو العنصر الجديد فقط
        // سنحافظ على سلوكك: إعادة القائمة كاملة
        return await (0, exports.getUsers)(req, res);
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.insertUser = insertUser;
/* ------------------------------ Update ----------------------------- */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id))
            return res.status(400).json({ formErrors: ["Identifiant invalide"] });
        const current = await UserModel_1.default.findById(id);
        if (!current)
            return res.status(404).json({ formErrors: ["Utilisateur introuvable"] });
        let { fullName, username, phone, email, password, roles, doctor, active, } = req.body;
        const formErrors = [];
        // si username changé → vérifier unicité
        if (typeof username === "string" && username.trim() !== current.username) {
            const username_lc = username.toLowerCase();
            const clash = await UserModel_1.default.findOne({ _id: { $ne: id }, username_lc });
            if (clash)
                formErrors.push("Le nom d'utilisateur existe déjà");
        }
        if (formErrors.length)
            return res.status(400).json({ formErrors });
        const update = {};
        if (typeof fullName === "string")
            update.fullName = fullName.trim();
        if (typeof username === "string") {
            update.username = username.trim();
            update.username_lc = username.trim().toLowerCase();
        }
        if (typeof phone === "string")
            update.phone = phone.trim();
        if (typeof email === "string")
            update.email = email.trim();
        if (Array.isArray(roles))
            update.roles = roles;
        if (typeof active === "boolean")
            update.active = active;
        if (doctor !== undefined)
            update.doctor = doctor;
        if (typeof password === "string" && password.trim().length > 0) {
            update.passwordHash = await bcryptjs_1.default.hash(password, 10);
        }
        await UserModel_1.default.updateOne({ _id: id }, { $set: update });
        // على منوالك: أعد القائمة بعد التحديث
        return await (0, exports.getUsers)(req, res);
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.updateUser = updateUser;
/* ------------------------------ Delete ----------------------------- */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id))
            return res.status(300).json({ formErrors: ["Identifiant invalide"] });
        // TODO: تحقق من علاقات المستخدم في وثائق أخرى إن كانت لازمة
        await UserModel_1.default.deleteOne({ _id: id });
        // أعد القائمة كما في منطقك السابق
        return await (0, exports.getUsers)(req, res);
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.deleteUser = deleteUser;
const listDoctors = async (req, res) => {
    try {
        const { q, page: pageRaw, limit: limitRaw } = req.query;
        const page = toPosInt(pageRaw, 1);
        const limit = toPosInt(limitRaw, 20, 100);
        const skip = (page - 1) * limit;
        const and = [{ "doctor.isDoctor": true }];
        if (q?.trim()) {
            const rx = new RegExp(escapeRegex(q.trim()), "i");
            and.push({ $or: [{ fullName: rx }, { username: rx }] });
        }
        const filter = { $and: and };
        const [total, items] = await Promise.all([
            UserModel_1.default.countDocuments(filter),
            UserModel_1.default.find(filter).select("_id fullName username").sort({ fullName: 1 }).skip(skip).limit(limit).lean()
        ]);
        const pages = Math.max(1, Math.ceil(total / limit));
        return res.status(200).json({ success: { items, total, page, limit, pages, hasNext: page < pages, hasPrev: page > 1 } });
    }
    catch (e) {
        return res.status(500).json({ err: e.message });
    }
};
exports.listDoctors = listDoctors;
//# sourceMappingURL=UserController.js.map