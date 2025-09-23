"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePatient = exports.updatePatient = exports.createPatient = exports.getPatient = exports.listPatients = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PatientModel_1 = __importDefault(require("../models/PatientModel"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
/* ===== Helpers ===== */
const toPosInt = (raw, def = 1, max = 1000000) => {
    const n = parseInt(String(raw ?? ""), 10);
    if (Number.isNaN(n) || n < 1)
        return def;
    return Math.min(n, max);
};
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isDoctorUser = (req) => !!req?.user?.doctor?.isDoctor;
const asObjectId = (id) => id && mongoose_1.default.isValidObjectId(id) ? new mongoose_1.default.Types.ObjectId(id) : null;
/* =========================================================
   GET /api/patients
   - Admin/Gérant : tous les patients (+ filtre q, doctorId, pagination)
   - Médecin     : uniquement ses patients (doctor = req.user._id)
   Query: q, page, limit, doctorId (optionnel pour admin/gerant)
   Retour: { items, total, page, limit, pages, hasNext, hasPrev }
   ========================================================= */
const listPatients = async (req, res) => {
    try {
        const { q, doctorId, page: pageRaw, limit: limitRaw } = req.query;
        const and = [];
        // Recherche texte
        if (q?.trim()) {
            const rx = new RegExp(escapeRegex(q.trim()), "i");
            and.push({ $or: [{ name: rx }, { phone: rx }, { notes: rx }] });
        }
        // Scope par rôle
        if (isDoctorUser(req)) {
            // médecin : uniquement ses patients
            and.push({ doctor: req.user._id });
        }
        else {
            // admin/gerant : peuvent filtrer par un médecin donné
            if (doctorId) {
                const oid = asObjectId(doctorId);
                if (!oid)
                    return res.status(300).json({ formErrors: ["doctorId invalide"] });
                and.push({ doctor: oid });
            }
        }
        const filter = and.length ? { $and: and } : {};
        // Pagination
        const page = toPosInt(pageRaw, 1);
        const limit = toPosInt(limitRaw, 10, 100);
        const skip = (page - 1) * limit;
        const [total, items] = await Promise.all([
            PatientModel_1.default.countDocuments(filter),
            PatientModel_1.default.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({ path: "doctor", select: "fullName username doctor" })
                .lean(),
        ]);
        const pages = Math.max(1, Math.ceil(total / limit));
        return res.status(200).json({
            // success: items ,
            success: { items, total, page, limit, pages, hasNext: page < pages, hasPrev: page > 1 },
        });
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.listPatients = listPatients;
/* =========================================================
   GET /api/patients/:id
   - Admin/Gérant : accès à tous
   - Médecin     : accès seulement si patient.doctor === moi
   ========================================================= */
const getPatient = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id))
            return res.status(300).json({ formErrors: ["ID invalide"] });
        const patient = await PatientModel_1.default.findById(id)
            .populate({ path: "doctor", select: "fullName username doctor" })
            .lean();
        if (!patient)
            return res.status(300).json({ formErrors: ["Patient introuvable"] });
        if (isDoctorUser(req)) {
            if (!patient.doctor || String(patient.doctor?._id ?? patient.doctor) !== String(req.user._id)) {
                return res.status(403).json({ formErrors: ["Accès refusé"] });
            }
        }
        return res.status(200).json({ success: patient });
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.getPatient = getPatient;
/* =========================================================
   POST /api/patients
   - Uniquement Admin/Gérant
   - Doit être assigné à un médecin (doctorId requis et valide)
   Body: { name, phone?, dob?, notes?, doctorId }
   ========================================================= */
const createPatient = async (req, res) => {
    try {
        if (isDoctorUser(req)) {
            return res.status(403).json({ formErrors: ["Création réservée à l'administration"] });
        }
        const { name, phone, dob, notes, doctorId } = req.body;
        const formErrors = [];
        if (!name?.trim())
            formErrors.push("Le nom est obligatoire");
        if (!doctorId)
            formErrors.push("Le médecin (doctorId) est obligatoire");
        const doctorOid = asObjectId(doctorId);
        if (!doctorOid)
            formErrors.push("doctorId invalide");
        if (formErrors.length)
            return res.status(300).json({ formErrors });
        // Vérifier que doctorId correspond à un utilisateur médecin
        const docUser = await UserModel_1.default.findById(doctorOid).lean();
        if (!docUser || !docUser.doctor?.isDoctor) {
            return res.status(300).json({ formErrors: ["Le docteur fourni est invalide"] });
        }
        const patient = await PatientModel_1.default.create({
            name: name.trim(),
            phone: phone?.trim() || undefined,
            dob: dob ? new Date(dob) : undefined,
            notes: notes?.trim() || undefined,
            doctor: doctorOid,
        });
        // return res.status(201).json({ success: patient });
        return await (0, exports.listPatients)(req, res);
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.createPatient = createPatient;
/* =========================================================
   PUT /api/patients/:id
   - Uniquement Admin/Gérant (médecin interdit)
   - Peut réassigner le patient à un autre médecin (doctorId)
   ========================================================= */
const updatePatient = async (req, res) => {
    try {
        if (isDoctorUser(req)) {
            return res.status(403).json({ formErrors: ["Modification réservée à l'administration"] });
        }
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id))
            return res.status(300).json({ formErrors: ["ID invalide"] });
        const { name, phone, dob, notes, doctorId } = req.body;
        const patch = {};
        if (name !== undefined)
            patch.name = String(name).trim();
        if (phone !== undefined)
            patch.phone = String(phone).trim() || undefined;
        if (dob !== undefined)
            patch.dob = dob ? new Date(dob) : undefined;
        if (notes !== undefined)
            patch.notes = String(notes).trim() || undefined;
        if (doctorId !== undefined) {
            if (doctorId === null || doctorId === "") {
                patch.doctor = null;
            }
            else {
                const oid = asObjectId(doctorId);
                if (!oid)
                    return res.status(300).json({ formErrors: ["doctorId invalide"] });
                const docUser = await UserModel_1.default.findById(oid).lean();
                if (!docUser || !docUser.doctor?.isDoctor) {
                    return res.status(300).json({ formErrors: ["Le docteur fourni est invalide"] });
                }
                patch.doctor = oid;
            }
        }
        const updated = await PatientModel_1.default.findByIdAndUpdate(id, { $set: patch }, { new: true })
            .populate({ path: "doctor", select: "fullName username doctor" })
            .lean();
        if (!updated)
            return res.status(300).json({ formErrors: ["Patient introuvable"] });
        // return res.status(200).json({ success: updated });
        return await (0, exports.listPatients)(req, res);
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.updatePatient = updatePatient;
/* =========================================================
   DELETE /api/patients/:id
   - Uniquement Admin/Gérant
   ========================================================= */
const deletePatient = async (req, res) => {
    try {
        if (isDoctorUser(req)) {
            return res.status(403).json({ formErrors: ["Suppression réservée à l'administration"] });
        }
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id))
            return res.status(300).json({ formErrors: ["ID invalide"] });
        const deleted = await PatientModel_1.default.findByIdAndDelete(id).lean();
        if (!deleted)
            return res.status(300).json({ formErrors: ["Patient introuvable"] });
        // return res.status(200).json({ success: true });
        return await (0, exports.listPatients)(req, res);
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.deletePatient = deletePatient;
