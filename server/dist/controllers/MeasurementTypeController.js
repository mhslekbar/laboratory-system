"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStage = exports.updateStage = exports.addStage = exports.deleteMeasurementType = exports.updateMeasurementType = exports.createMeasurementType = exports.listMeasurementTypes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MeasurementTypeModel_1 = __importDefault(require("../models/MeasurementTypeModel"));
const CaseModel_1 = __importDefault(require("../models/CaseModel"));
const toPosInt = (raw, def = 1, max = 1000000) => {
    const n = parseInt(String(raw ?? ""), 10);
    if (Number.isNaN(n) || n < 1)
        return def;
    return Math.min(n, max);
};
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isValidObjectId = (v) => typeof v === "string" && mongoose_1.default.Types.ObjectId.isValid(v);
const validateStageList = (stages = []) => {
    for (const s of stages) {
        if (!s.name?.trim())
            return `Chaque étape doit avoir un 'name'.`;
        if (typeof s.order !== "number" || s.order < 1)
            return `L'étape '${s.name}' a un 'order' invalide (>= 1).`;
        if (s.allowedRoles) {
            if (!Array.isArray(s.allowedRoles))
                return `allowedRoles doit être un tableau.`;
            for (const r of s.allowedRoles) {
                if (!isValidObjectId(String(r)))
                    return `allowedRoles contient un ObjectId invalide.`;
            }
        }
    }
    return null;
};
const normalizeStages = (stages = []) => stages.map((s, i) => ({
    _id: isValidObjectId(String(s._id)) ? new mongoose_1.default.Types.ObjectId(String(s._id)) : undefined,
    name: s.name?.trim(),
    order: typeof s.order === "number" && s.order >= 1 ? s.order : i + 1,
    color: s.color?.trim(),
    allowedRoles: Array.isArray(s.allowedRoles)
        ? s.allowedRoles.map((r) => new mongoose_1.default.Types.ObjectId(String(r)))
        : [],
}));
/** ===== List ===== */
const listMeasurementTypes = async (req, res) => {
    try {
        const { q, page: pageRaw, limit: limitRaw } = req.query;
        const page = toPosInt(pageRaw, 1);
        const limit = toPosInt(limitRaw, 10, 100);
        const skip = (page - 1) * limit;
        const and = [];
        if (q?.trim()) {
            const rx = new RegExp(escapeRegex(q.trim()), "i");
            and.push({
                $or: [{ key: rx }, { name: rx }, { "stages.name": rx }],
            });
        }
        const filter = and.length ? { $and: and } : {};
        const [total, items] = await Promise.all([
            MeasurementTypeModel_1.default.countDocuments(filter),
            MeasurementTypeModel_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        ]);
        const pages = Math.max(1, Math.ceil(total / limit));
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
    catch (e) {
        return res.status(500).json({ err: e.message });
    }
};
exports.listMeasurementTypes = listMeasurementTypes;
/** ===== Create ===== */
const createMeasurementType = async (req, res) => {
    try {
        const { key, name, stages = [] } = req.body;
        if (!key?.trim() || !name?.trim())
            return res.status(400).json({ formErrors: ["'key' et 'name' sont obligatoires."] });
        const normalized = normalizeStages(stages);
        const err = validateStageList(normalized);
        if (err)
            return res.status(400).json({ formErrors: [err] });
        const exists = await MeasurementTypeModel_1.default.findOne({ key });
        if (exists)
            return res.status(400).json({ formErrors: [`'key' déjà utilisé: ${key}`] });
        const created = await MeasurementTypeModel_1.default.create({
            key,
            name,
            stages: normalized.map((s) => ({
                name: s.name,
                color: s.color,
                order: s.order,
                allowedRoles: s.allowedRoles || [],
            })),
        });
        if (!created)
            return res.status(400).json({ formErrors: ["Création échouée."] });
        return (0, exports.listMeasurementTypes)(req, res);
    }
    catch (e) {
        return res.status(500).json({ err: e.message });
    }
};
exports.createMeasurementType = createMeasurementType;
/**
 * IMPORTANT:
 * - We DO NOT replace the whole 'stages' array to preserve existing _id (referenced by Case).
 * - If 'stages' sent: update existing ones by _id; add only new ones (no delete here).
 * - Deletions happen via removeStage (with Case usage checks).
 */
const updateMeasurementType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, stages } = req.body;
        const doc = await MeasurementTypeModel_1.default.findById(id);
        if (!doc)
            return res.status(404).json({ formErrors: ["Type non trouvé."] });
        if (typeof name === "string")
            doc.name = name.trim();
        if (Array.isArray(stages)) {
            const normalized = normalizeStages(stages);
            const err = validateStageList(normalized);
            if (err)
                return res.status(400).json({ formErrors: [err] });
            // Map existing by _id (string)
            const existingById = new Map(doc.stages.map((s) => [String(s._id), s]));
            for (const s of normalized) {
                if (s._id && existingById.has(String(s._id))) {
                    // update in place
                    const tgt = existingById.get(String(s._id));
                    tgt.name = s.name;
                    tgt.color = s.color;
                    tgt.order = s.order;
                    if (Array.isArray(s.allowedRoles)) {
                        tgt.allowedRoles = s.allowedRoles;
                    }
                }
                else {
                    // add new stage
                    doc.stages.push({
                        name: s.name,
                        color: s.color,
                        order: s.order,
                        allowedRoles: s.allowedRoles || [],
                    });
                }
            }
            // Reorder 1..N
            doc.stages = [...doc.stages]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((s, i) => ({ ...s, order: i + 1 }));
        }
        await doc.save();
        return (0, exports.listMeasurementTypes)(req, res);
    }
    catch (e) {
        return res.status(500).json({ err: e.message });
    }
};
exports.updateMeasurementType = updateMeasurementType;
/** ===== Delete Type (unchanged) ===== */
const deleteMeasurementType = async (req, res) => {
    try {
        const { id } = req.params;
        const usedCount = await CaseModel_1.default.countDocuments({ type: new mongoose_1.default.Types.ObjectId(id) });
        if (usedCount > 0) {
            return res.status(400).json({
                formErrors: [`Impossible de supprimer: ${usedCount} dossier(s) utilisent ce type.`],
            });
        }
        const deleted = await MeasurementTypeModel_1.default.findByIdAndDelete(id);
        if (!deleted)
            return res.status(404).json({ formErrors: ["Type non trouvé."] });
        return (0, exports.listMeasurementTypes)(req, res);
    }
    catch (e) {
        return res.status(500).json({ err: e.message });
    }
};
exports.deleteMeasurementType = deleteMeasurementType;
/** ===== Stages actions (now use :stageId) ===== */
/** Add a stage (no key anymore) */
const addStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;
        if (!stage?.name?.trim())
            return res.status(400).json({ formErrors: ["Étape invalide: 'name' requis."] });
        const doc = await MeasurementTypeModel_1.default.findById(id);
        if (!doc)
            return res.status(404).json({ formErrors: ["Type non trouvé."] });
        const maxOrder = doc.stages.reduce((m, s) => Math.max(m, s.order || 0), 0);
        const allowedRoles = Array.isArray(stage.allowedRoles)
            ? stage.allowedRoles.map((r) => new mongoose_1.default.Types.ObjectId(String(r)))
            : [];
        doc.stages.push({
            name: stage.name.trim(),
            color: stage.color?.trim(),
            order: typeof stage.order === "number" && stage.order > 0 ? stage.order : maxOrder + 1,
            allowedRoles,
        });
        // Reorder 1..N
        doc.stages = [...doc.stages]
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((s, i) => ({ ...s, order: i + 1 }));
        await doc.save();
        return (0, exports.listMeasurementTypes)(req, res);
    }
    catch (e) {
        return res.status(500).json({ err: e.message });
    }
};
exports.addStage = addStage;
/**
 * Update a stage by :stageId
 * params: :id, :stageId
 * body: { name?, color?, order?, allowedRoles? }
 */
const updateStage = async (req, res) => {
    try {
        const { id, stageId } = req.params;
        const { name, color, order, allowedRoles } = req.body;
        if (!isValidObjectId(stageId))
            return res.status(400).json({ formErrors: ["stageId invalide."] });
        const doc = await MeasurementTypeModel_1.default.findById(id);
        if (!doc)
            return res.status(404).json({ formErrors: ["Type non trouvé."] });
        const idx = doc.stages.findIndex((s) => String(s._id) === String(stageId));
        if (idx < 0)
            return res.status(404).json({ formErrors: ["Étape non trouvée."] });
        if (typeof name === "string")
            doc.stages[idx].name = name.trim();
        if (typeof color === "string")
            doc.stages[idx].color = color.trim();
        if (typeof order === "number" && order >= 1)
            doc.stages[idx].order = order;
        if (Array.isArray(allowedRoles)) {
            const mapped = allowedRoles.map((r) => {
                if (!isValidObjectId(String(r)))
                    throw new Error("ObjectId invalide dans allowedRoles.");
                return new mongoose_1.default.Types.ObjectId(String(r));
            });
            doc.stages[idx].allowedRoles = mapped;
        }
        // Reorder 1..N
        doc.stages = [...doc.stages]
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((s, i) => ({ ...s, order: i + 1 }));
        await doc.save();
        return (0, exports.listMeasurementTypes)(req, res);
    }
    catch (e) {
        return res.status(500).json({ err: e.message });
    }
};
exports.updateStage = updateStage;
/**
 * removeStage by :stageId
 * - If used in Cases: returns error with count unless force=true
 * - If force=true: cleans up cases and adjusts currentStageOrder + delivery
 */
const removeStage = async (req, res) => {
    try {
        const { id, stageId } = req.params;
        const { force } = req.query;
        if (!isValidObjectId(stageId))
            return res.status(400).json({ formErrors: ["stageId invalide."] });
        const doc = await MeasurementTypeModel_1.default.findById(id);
        if (!doc)
            return res.status(404).json({ formErrors: ["Type non trouvé."] });
        const idx = doc.stages.findIndex((s) => String(s._id) === String(stageId));
        if (idx < 0)
            return res.status(404).json({ formErrors: ["Étape non trouvée."] });
        const stageObjectId = doc.stages[idx]._id;
        const stageOrder = doc.stages[idx].order;
        const usedCount = await CaseModel_1.default.countDocuments({
            type: new mongoose_1.default.Types.ObjectId(id),
            "stages.stage": stageObjectId,
        });
        if (usedCount > 0 && force !== "true") {
            return res.status(400).json({
                formErrors: [
                    `Étape utilisée dans ${usedCount} dossier(s). Ajoutez '?force=true' pour supprimer et nettoyer les dossiers.`,
                ],
            });
        }
        // Remove from type
        doc.stages.splice(idx, 1);
        doc.stages = doc.stages.map((s, i) => ({ ...s, order: i + 1 }));
        await doc.save();
        if (usedCount > 0) {
            const affected = await CaseModel_1.default.find({
                type: new mongoose_1.default.Types.ObjectId(id),
                "stages.stage": stageObjectId,
            });
            const now = new Date();
            for (const c of affected) {
                // remove stage ref from case
                c.stages = c.stages.filter((s) => String(s.stage) !== String(stageObjectId));
                // adjust currentStageOrder
                if ((c.currentStageOrder || 0) >= stageOrder) {
                    const totalAfter = doc.stages.length;
                    c.currentStageOrder = Math.min(c.currentStageOrder || 0, totalAfter);
                }
                // delivery recalculation
                const totalAfter = doc.stages.length;
                if (totalAfter === 0) {
                    c.delivery = { status: "pending" };
                }
                else if ((c.currentStageOrder || 0) >= totalAfter) {
                    c.delivery.status = "delivered";
                    c.delivery.date = c.delivery.date || now;
                }
                else if ((c.currentStageOrder || 0) === totalAfter - 1) {
                    c.delivery.status = "scheduled";
                    c.delivery.date = undefined;
                }
                else {
                    c.delivery.status = "pending";
                    c.delivery.date = undefined;
                }
                // audit trail
                c.auditTrail.push({
                    actorRole: "SYSTEM",
                    action: "stage_removed",
                    at: now,
                    meta: { stageId, reason: "force_delete_from_type" },
                });
                await c.save();
            }
        }
        return (0, exports.listMeasurementTypes)(req, res);
    }
    catch (e) {
        return res.status(500).json({ err: e.message });
    }
};
exports.removeStage = removeStage;
//# sourceMappingURL=MeasurementTypeController.js.map