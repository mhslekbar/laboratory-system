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
const validateStageList = (stages = []) => {
    const keys = new Set();
    for (const s of stages) {
        if (!s.key?.trim())
            return "Chaque étape doit avoir un 'key'.";
        if (keys.has(s.key))
            return `Étape en double: '${s.key}'.`;
        keys.add(s.key);
        if (!s.name?.trim())
            return `L'étape '${s.key}' doit avoir un nom.`;
        if (typeof s.order !== "number" || s.order < 1)
            return `L'étape '${s.key}' a un 'order' invalide.`;
    }
    return null;
};
const normalizeStages = (stages = []) => stages.map((s, i) => ({
    key: s.key?.trim(),
    name: s.name?.trim(),
    order: typeof s.order === "number" && s.order >= 1 ? s.order : i + 1,
    color: s.color?.trim(),
}));
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
                $or: [{ key: rx }, { name: rx }, { "stages.name": rx }, { "stages.key": rx }],
            });
        }
        const filter = and.length ? { $and: and } : {};
        const [total, items] = await Promise.all([
            MeasurementTypeModel_1.default.countDocuments(filter),
            MeasurementTypeModel_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        ]);
        const pages = Math.max(1, Math.ceil(total / limit));
        return res
            .status(200)
            .json({
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
        const created = await MeasurementTypeModel_1.default.create({ key, name, stages: normalized });
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
 * IMPORTANT: لا نستبدل stages بالكامل حتى لا نخسر _id (المراجع من Case).
 * - إن أُرسلت stages: نحدّث الموجودة حسب key (نُبقي _id كما هو)،
 *   ونضيف فقط المراحل الجديدة (keys غير الموجودة).
 * - لا نحذف المراحل الغائبة هنا؛ الحذف يتم عبر removeStage (مع فحص الاستعمال في Case).
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
            // خريطة الموجودين بحسب key للحفاظ على _id
            const existingByKey = new Map(doc.stages.map((s) => [s.key, s]));
            // تحديث/إضافة بدون حذف
            for (const s of normalized) {
                const exists = existingByKey.get(s.key);
                if (exists) {
                    exists.name = s.name;
                    exists.color = s.color;
                    exists.order = s.order;
                }
                else {
                    doc.stages.push({
                        key: s.key,
                        name: s.name,
                        color: s.color,
                        order: s.order,
                    });
                }
            }
            // إعادة ترتيب 1..N
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
const deleteMeasurementType = async (req, res) => {
    try {
        const { id } = req.params;
        // امنع الحذف إذا هناك Cases تعتمد هذا النوع
        const usedCount = await CaseModel_1.default.countDocuments({ type: new mongoose_1.default.Types.ObjectId(id) });
        if (usedCount > 0) {
            return res
                .status(400)
                .json({
                formErrors: [
                    `Impossible de supprimer: ${usedCount} dossier(s) utilisent ce type.`,
                ],
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
/** === Actions ciblées sur stages === */
const addStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;
        if (!stage?.key?.trim() || !stage?.name?.trim())
            return res.status(400).json({ formErrors: ["Étape invalide."] });
        const doc = await MeasurementTypeModel_1.default.findById(id);
        if (!doc)
            return res.status(404).json({ formErrors: ["Type non trouvé."] });
        if (doc.stages.some((s) => s.key === stage.key)) {
            return res
                .status(400)
                .json({ formErrors: [`Étape '${stage.key}' existe déjà.`] });
        }
        const maxOrder = doc.stages.reduce((m, s) => Math.max(m, s.order || 0), 0);
        doc.stages.push({
            key: stage.key.trim(),
            name: stage.name.trim(),
            color: stage.color?.trim(),
            order: stage.order && stage.order > 0 ? stage.order : maxOrder + 1,
        });
        // إعادة ترقيم 1..N
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
 * updateStage يدعم تغيير key أيضاً (مع التحقق من التفرد)
 * params: :id, :stageKey (القديمة)
 * body: { name?, color?, order?, key? }
 */
const updateStage = async (req, res) => {
    try {
        const { id, stageKey } = req.params;
        const { name, color, order, key } = req.body;
        const doc = await MeasurementTypeModel_1.default.findById(id);
        if (!doc)
            return res.status(404).json({ formErrors: ["Type non trouvé."] });
        const idx = doc.stages.findIndex((s) => s.key === stageKey);
        if (idx < 0)
            return res.status(404).json({ formErrors: ["Étape non trouvée."] });
        // لو طلب تغيير key، تحقق التفرد
        if (typeof key === "string" && key.trim() && key.trim() !== stageKey) {
            if (doc.stages.some((s, i) => i !== idx && s.key === key.trim())) {
                return res.status(400).json({ formErrors: [`'key' déjà utilisé: ${key.trim()}`] });
            }
            doc.stages[idx].key = key.trim();
        }
        if (typeof name === "string")
            doc.stages[idx].name = name.trim();
        if (typeof color === "string")
            doc.stages[idx].color = color.trim();
        if (typeof order === "number" && order >= 1)
            doc.stages[idx].order = order;
        // إعادة الترتيب 1..N
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
 * removeStage:
 *  - يحذف المرحلة حسب الـ key
 *  - إن كانت مستخدمة داخل Cases: يعيد خطأ مع العدد، إلا لو force=true
 *  - force: يسحب المرجع من كل Case مناسب ويعدّل currentStageOrder + auditTrail
 */
const removeStage = async (req, res) => {
    try {
        const { id, stageKey } = req.params;
        const { force } = req.query;
        const doc = await MeasurementTypeModel_1.default.findById(id);
        if (!doc)
            return res.status(404).json({ formErrors: ["Type non trouvé."] });
        const idx = doc.stages.findIndex((s) => s.key === stageKey);
        if (idx < 0)
            return res.status(404).json({ formErrors: ["Étape non trouvée."] });
        const stageId = doc.stages[idx]._id;
        const stageOrder = doc.stages[idx].order;
        const usedCount = await CaseModel_1.default.countDocuments({
            type: new mongoose_1.default.Types.ObjectId(id),
            "stages.stage": stageId,
        });
        if (usedCount > 0 && force !== "true") {
            return res.status(400).json({
                formErrors: [
                    `Étape utilisée dans ${usedCount} dossier(s). Ajoutez '?force=true' pour supprimer et nettoyer les dossiers.`,
                ],
            });
        }
        // احذف من الـ type
        doc.stages.splice(idx, 1);
        // إعادة ترقيم 1..N
        doc.stages = doc.stages.map((s, i) => ({ ...s, order: i + 1 }));
        await doc.save();
        if (usedCount > 0) {
            // نظّف الحالات المتأثرة: اسحب المرحلة من المصفوفة واضبط currentStageOrder
            const affected = await CaseModel_1.default.find({
                type: new mongoose_1.default.Types.ObjectId(id),
                "stages.stage": stageId,
            });
            const now = new Date();
            for (const c of affected) {
                // اسحب المرجع من stages
                c.stages = c.stages.filter((s) => String(s.stage) !== String(stageId));
                // عدّل currentStageOrder: إذا كان المؤشر على مرحلة بعد/يساوي المرحلة المحذوفة
                if ((c.currentStageOrder || 0) >= stageOrder) {
                    // إجمالي مراحل النوع بعد الحذف
                    const totalAfter = doc.stages.length;
                    c.currentStageOrder = Math.min(c.currentStageOrder || 0, totalAfter);
                }
                // ضبط التسليم حسب الموضع الجديد
                const totalAfter = doc.stages.length;
                if (totalAfter === 0) {
                    // لا مراحل — ارجع التسليم لوضع افتراضي
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
                // أثر
                c.auditTrail.push({
                    actorRole: "SYSTEM",
                    action: "stage_removed",
                    at: now,
                    meta: { stageKey, stageId, reason: "force_delete_from_type" },
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
