"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAttachment = exports.addAttachment = exports.approveCase = exports.setDeliveryStatus = exports.setStageStatus = exports.advanceStage = exports.deleteCase = exports.updateCase = exports.createCase = exports.getCaseById = exports.listCases = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const CaseModel_1 = __importDefault(require("../models/CaseModel"));
const MeasurementTypeModel_1 = __importDefault(require("../models/MeasurementTypeModel"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const fail = (res, code = 300, msg = "Erreur") => {
    console.log("msg: ", msg);
    return res.status(code).json({ error: msg });
};
/* ======================= Helpers ======================= */
const toPosInt = (raw, def = 1, max = 1000000) => {
    const n = parseInt(String(raw ?? ""), 10);
    if (Number.isNaN(n) || n < 1)
        return def;
    return Math.min(n, max);
};
// تحويل نص إلى ObjectId إن أمكن
const asId = (v) => v && mongoose_1.default.isValidObjectId(v) ? new mongoose_1.default.Types.ObjectId(v) : undefined;
const isValidObjectId = (v) => typeof v === "string" && mongoose_1.default.Types.ObjectId.isValid(v);
// جلب تفاصيل المراحل ديناميكياً + populate (patient, doctor[user], type)
const aggregateCaseWithStages = (match) => [
    { $match: match },
    // --- TYPE (measurementtypes) ---
    {
        $lookup: {
            from: "measurementtypes",
            localField: "type",
            foreignField: "_id",
            as: "mt",
        },
    },
    { $unwind: "$mt" },
    // --- PATIENT ---
    {
        $lookup: {
            from: "patients",
            localField: "patient",
            foreignField: "_id",
            as: "patient",
        },
    },
    { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
    // --- DOCTOR (users) ---
    {
        $lookup: {
            from: "users",
            localField: "doctor",
            foreignField: "_id",
            as: "doctor",
        },
    },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    // --- stages المعروضة تُشتق من قالب النوع (mt.stages) ---
    {
        $addFields: {
            // أعِد تشكيل type ليحمل معلومات العرض المفيدة
            type: { _id: "$mt._id", key: "$mt.key", name: "$mt.name" },
            stages: {
                $map: {
                    input: "$stages",
                    as: "cs",
                    in: {
                        $let: {
                            vars: {
                                tpl: {
                                    $first: {
                                        $filter: {
                                            input: "$mt.stages",
                                            as: "t",
                                            cond: { $eq: ["$$t._id", "$$cs.stage"] },
                                        },
                                    },
                                },
                            },
                            in: {
                                stage: "$$cs.stage", // المرجع المخزّن (ObjectId)
                                status: "$$cs.status",
                                startedAt: "$$cs.startedAt",
                                completedAt: "$$cs.completedAt",
                                assignedTo: "$$cs.assignedTo",
                                // قيم العرض من القالب (بدون key، مع allowedRoles)
                                name: "$$tpl.name",
                                order: "$$tpl.order",
                                color: "$$tpl.color",
                                allowedRoles: "$$tpl.allowedRoles",
                            },
                        },
                    },
                },
            },
        },
    },
    // إحذف mt المؤقتة من الخرج
    { $project: { mt: 0 } },
];
// البحث بالنص q على code و أسماء المراحل (لا يوجد stages.key بعد الآن)
const buildSearchMatch = (q) => {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return {
        $or: [
            { code: rx },
            { "patient.name": rx },
            { "patient.phone": rx },
            { "doctor.username": rx },
            { "doctor.fullName": rx },
            { "type.key": rx }, // نوع القياس ما زال لديه key
            { "type.name": rx },
            { "stages.name": rx },
        ],
    };
};
// مولد كود بسيط (استبدله بعدّاد مركزي عند الحاجة)
async function nextCaseCode() {
    const count = await CaseModel_1.default.countDocuments();
    return `JOB-${String(count + 1).padStart(6, "0")}`;
}
/* =========================================================
   GET /api/cases?q=&doctorId=&patientId=&typeId=&status=&page=&limit=
   (يعيد المراحل مثراة بديناميكياً)
========================================================= */
const listCases = async (req, res) => {
    try {
        const { q = "", doctorId, patientId, typeId, status, // delivery.status
        page = 1, limit = 10, } = req.query;
        const pageNum = toPosInt(page, 1);
        const limitNum = Math.min(200, toPosInt(limit, 10));
        const skip = (pageNum - 1) * limitNum;
        const match = {};
        if (doctorId)
            match.doctor = asId(String(doctorId));
        if (patientId)
            match.patient = asId(String(patientId));
        if (typeId)
            match.type = asId(String(typeId));
        if (status)
            match["delivery.status"] = String(status);
        const pipeline = [
            ...aggregateCaseWithStages(match),
            ...(q ? [{ $match: buildSearchMatch(q) }] : []),
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limitNum },
        ];
        const [items, totalArr] = await Promise.all([
            CaseModel_1.default.aggregate(pipeline),
            CaseModel_1.default.aggregate([
                ...aggregateCaseWithStages(match),
                ...(q ? [{ $match: buildSearchMatch(q) }] : []),
                { $count: "n" },
            ]),
        ]);
        const total = totalArr?.[0]?.n || 0;
        const pages = Math.max(1, Math.ceil(total / limitNum));
        res.status(200).json({
            success: {
                items,
                total,
                page: pageNum,
                pages,
                limit: limitNum,
                hasPrev: pageNum > 1,
                hasNext: pageNum < pages,
            },
        });
    }
    catch (e) {
        return fail(res, 500, "Erreur lors du listing");
    }
};
exports.listCases = listCases;
/* =========================================================
   GET /api/cases/:id
========================================================= */
const getCaseById = async (req, res) => {
    try {
        const _id = asId(req.params.id);
        if (!_id)
            return fail(res, 300, "ID invalide");
        const rows = await CaseModel_1.default.aggregate(aggregateCaseWithStages({ _id }));
        const c = rows[0];
        if (!c)
            return fail(res, 404, "Dossier introuvable");
        return res.status(200).json({ success: c });
    }
    catch {
        return fail(res, 500, "Erreur");
    }
};
exports.getCaseById = getCaseById;
/* =========================================================
   POST /api/cases  body: { code?, doctor, patient, type, note? }
   يبني stages من MeasurementType.stages كمراجع فقط
========================================================= */
const createCase = async (req, res) => {
    try {
        const { code, doctor, patient, type, note } = req.body || {};
        if (!doctor || !patient || !type)
            return fail(res, 300, "doctor, patient, type requis");
        const typeDoc = await MeasurementTypeModel_1.default.findById(type).lean();
        if (!typeDoc)
            return fail(res, 300, "Type introuvable");
        const stages = (typeDoc.stages || [])
            .slice()
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((tpl) => ({ stage: tpl._id, status: "pending" }));
        const caseCode = code || (await nextCaseCode());
        const now = new Date();
        const created = await CaseModel_1.default.create({
            code: caseCode,
            doctor,
            patient,
            type,
            note,
            currentStageOrder: 0,
            stages,
            attachments: [],
            delivery: { status: "pending" },
            caseApproval: { approved: false },
            auditTrail: [{ action: "create", actorRole: "LAB", at: now, meta: { code: caseCode } }],
        });
        const rows = await CaseModel_1.default.aggregate(aggregateCaseWithStages({ _id: created._id }));
        return res.status(201).json({ success: rows[0] });
    }
    catch (e) {
        return fail(res, 500, "Création impossible");
    }
};
exports.createCase = createCase;
/* =========================================================
   PUT /api/cases/:id  (champs simples)
========================================================= */
const updateCase = async (req, res) => {
    try {
        const allowed = ["doctor", "patient", "type", "delivery", "caseApproval", "attachments", "note", "currentStageOrder"];
        const patch = {};
        for (const k of allowed)
            if (k in req.body)
                patch[k] = req.body[k];
        const c = await CaseModel_1.default.findByIdAndUpdate(req.params.id, patch, { new: true });
        if (!c)
            return fail(res, 404, "Dossier introuvable");
        const rows = await CaseModel_1.default.aggregate(aggregateCaseWithStages({ _id: c._id }));
        return res.status(200).json({ success: rows[0] });
    }
    catch {
        return fail(res, 500, "Mise à jour impossible");
    }
};
exports.updateCase = updateCase;
/* =========================================================
   DELETE /api/cases/:id
========================================================= */
const deleteCase = async (req, res) => {
    try {
        const c = await CaseModel_1.default.findByIdAndDelete(req.params.id);
        if (!c)
            return fail(res, 404, "Dossier introuvable");
        return res.status(200).json({ success: true });
    }
    catch {
        return fail(res, 500, "Suppression impossible");
    }
};
exports.deleteCase = deleteCase;
/* =========================================================
   POST /api/cases/:id/advance
   body: { toOrder?, toStageId?, status?, asRoleId? }
   - يحرك المؤشر إلى مرحلة مستهدفة
   - يحدّث حالات المراحل المحيطة
   - يضبط حالة التسليم وفق الموضع
   - إذا أرسلت asRoleId: يتحقق من السماح في allowedRoles للمرحلة المستهدفة
========================================================= */
const advanceStage = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { toOrder, toStageId, status } = req.body || {};
        if (!userId)
            return fail(res, 401, "Non authentifié");
        // 1) Charger l'utilisateur et normaliser ses rôles -> tableau de strings
        const user = await UserModel_1.default.findById(userId).select("_id role roles").lean();
        if (!user)
            return fail(res, 401, "Utilisateur introuvable");
        const userRoleIds = user.roles?.map((r) => String(r));
        if (userRoleIds.length === 0)
            return fail(res, 403, "Aucun rôle associé à l’utilisateur");
        // 2) Charger le dossier + type
        const c = await CaseModel_1.default.findById(req.params.id).lean();
        if (!c)
            return fail(res, 404, "Dossier introuvable");
        if (!Array.isArray(c.stages) || c.stages.length === 0)
            return fail(res, 300, "Aucune étape");
        const mt = await MeasurementTypeModel_1.default.findById(c.type).lean();
        if (!mt)
            return fail(res, 300, "Type introuvable");
        const total = (mt.stages || []).length;
        if (!total)
            return fail(res, 300, "Type sans étapes");
        // 3) Déterminer l’étape cible (order + _id)
        let targetOrder;
        let targetStageIdStr;
        if (typeof toOrder === "number") {
            targetOrder = toOrder;
            const foundByOrder = (mt.stages || []).find((s) => s.order === toOrder);
            if (foundByOrder)
                targetStageIdStr = String(foundByOrder._id);
        }
        else if (toStageId && isValidObjectId(toStageId)) {
            const found = (mt.stages || []).find((s) => String(s._id) === String(toStageId));
            if (found) {
                targetOrder = found.order;
                targetStageIdStr = String(found._id);
            }
        }
        if (typeof targetOrder !== "number") {
            // défaut : étape suivante
            const next = Math.min((c.currentStageOrder || 0) + 1, total);
            targetOrder = next;
            const foundByOrder = (mt.stages || []).find((s) => s.order === next);
            if (foundByOrder)
                targetStageIdStr = String(foundByOrder._id);
        }
        if (!targetOrder || targetOrder < 1 || targetOrder > total) {
            return fail(res, 300, `Ordre cible invalide (1..${total})`);
        }
        // 4) RBAC : allowedRoles vide/absent => accès ouvert. Sinon, intersection avec les rôles de l'utilisateur.
        const targetTpl = (mt.stages || []).find((s) => s.order === targetOrder);
        if (!targetTpl)
            return fail(res, 300, "Étape cible introuvable");
        const allowed = Array.isArray(targetTpl.allowedRoles)
            ? targetTpl.allowedRoles.map((r) => String(r))
            : [];
        if (allowed.length > 0) {
            const allowedForUser = allowed.some((r) => userRoleIds.includes(String(r)));
            console.log("allowedForUser: ", allowedForUser);
            if (!allowedForUser)
                return fail(res, 403, "Rôle non autorisé pour cette étape");
        }
        // 5) Construire la nouvelle liste de stages (statuts)
        const orderToId = new Map();
        (mt.stages || []).forEach((s) => orderToId.set(s.order, String(s._id)));
        const now = new Date();
        const prevOrder = c.currentStageOrder || 0;
        const newStages = c.stages.map((row) => {
            const stgId = String(row.stage);
            const ord = [...orderToId.entries()].find(([, id]) => id === stgId)?.[0];
            if (!ord)
                return row;
            if (ord < targetOrder) {
                return {
                    ...row,
                    status: "done",
                    startedAt: row.startedAt || now,
                    completedAt: row.completedAt || now,
                };
            }
            else if (ord > targetOrder) {
                return {
                    ...row,
                    status: "pending",
                    startedAt: undefined,
                    completedAt: undefined,
                };
            }
            else {
                const desired = status || "in_progress";
                return {
                    ...row,
                    status: desired,
                    startedAt: desired === "pending" ? undefined : row.startedAt || now,
                    completedAt: desired === "done" ? now : undefined,
                };
            }
        });
        // 6) Livraison (pending/scheduled/delivered)
        const delivery = c.delivery || { status: "pending" };
        if (targetOrder === total) {
            delivery.status = "delivered";
            delivery.date = delivery.date || now;
        }
        else if (targetOrder === total - 1) {
            delivery.status = "scheduled";
            delivery.date = undefined;
        }
        else {
            delivery.status = "pending";
            delivery.date = undefined;
        }
        // 7) Sauvegarde + audit
        const updated = await CaseModel_1.default.findByIdAndUpdate(req.params.id, {
            $set: {
                stages: newStages,
                currentStageOrder: targetOrder,
                delivery,
            },
            $push: {
                auditTrail: {
                    at: now,
                    actorRole: "LAB",
                    action: "advance",
                    meta: {
                        from: prevOrder,
                        to: targetOrder,
                        by: targetStageIdStr ? { type: "stageId", value: targetStageIdStr } : { type: "order", value: targetOrder },
                        statusOverride: status || null,
                        actorUser: String(userId),
                        actorRoles: userRoleIds,
                        rbac: {
                            allowedRolesOnStage: allowed, // vide => ouvert
                            granted: allowed.length === 0 || allowed.some((r) => userRoleIds.includes(String(r))),
                        },
                    },
                },
            },
        }, { new: true });
        const rows = await CaseModel_1.default.aggregate(aggregateCaseWithStages({ _id: updated._id }));
        return res.status(200).json({ success: rows[0] });
    }
    catch (e) {
        return fail(res, 500, "Transition impossible");
    }
};
exports.advanceStage = advanceStage;
/* =========================================================
   POST /api/cases/:id/stages/:stageId/status
   body: { status, note?, asRoleId? }
   - :stageId يجب أن يكون ObjectId صالح
   - إذا أرسلت asRoleId: يتحقق من السماح في allowedRoles للمرحلة
========================================================= */
const setStageStatus = async (req, res) => {
    try {
        const { status, note } = req.body || {};
        if (!status)
            return fail(res, 300, "status requis");
        const rawStageId = req.params.stageId;
        if (!isValidObjectId(rawStageId))
            return fail(res, 300, "stageId invalide");
        // --- Auth & rôles utilisateur
        const userId = req.user?._id;
        if (!userId)
            return fail(res, 401, "Non authentifié");
        const user = await UserModel_1.default.findById(userId).select("_id role roles").lean();
        if (!user)
            return fail(res, 401, "Utilisateur introuvable");
        const userRoleIds = user.roles?.filter(Boolean)
            .map((r) => String(r));
        if (userRoleIds.length === 0)
            return fail(res, 403, "Aucun rôle associé à l’utilisateur");
        // --- Charger le dossier et le type
        const c = await CaseModel_1.default.findById(req.params.id).lean();
        if (!c)
            return fail(res, 404, "Dossier introuvable");
        const mt = await MeasurementTypeModel_1.default.findById(c.type).lean();
        if (!mt)
            return fail(res, 300, "Type introuvable");
        const stageId = new mongoose_1.default.Types.ObjectId(rawStageId);
        const tpl = (mt.stages || []).find((s) => String(s._id) === String(stageId));
        if (!tpl)
            return fail(res, 404, "Étape introuvable");
        // --- RBAC: allowedRoles vide/absent => accès ouvert, sinon intersection avec userRoleIds
        const allowed = Array.isArray(tpl.allowedRoles)
            ? tpl.allowedRoles.map((r) => String(r))
            : [];
        if (allowed.length > 0) {
            const allowedForUser = allowed.some((r) => userRoleIds.includes(String(r)));
            if (!allowedForUser)
                return fail(res, 403, "Rôle non autorisé pour cette étape");
        }
        // --- Patch du statut
        const now = new Date();
        const patched = c.stages.map((row) => {
            if (String(row.stage) !== String(stageId))
                return row;
            const next = { ...row, status };
            if (status === "in_progress") {
                next.startedAt = row.startedAt || now;
                next.completedAt = undefined;
            }
            else if (status === "done") {
                next.startedAt = row.startedAt || now;
                next.completedAt = now;
            }
            else {
                next.startedAt = undefined;
                next.completedAt = undefined;
            }
            if (note !== undefined)
                next.note = note; // si tu as un champ note au niveau de la ligne stage
            return next;
        });
        const updated = await CaseModel_1.default.findByIdAndUpdate(req.params.id, {
            $set: { stages: patched },
            $push: {
                auditTrail: {
                    at: now,
                    actorRole: "LAB",
                    action: "stage_status",
                    meta: {
                        stage: String(stageId),
                        status,
                        note: note ?? null,
                        actorUser: String(userId),
                        actorRoles: userRoleIds,
                        rbac: {
                            allowedRolesOnStage: allowed, // vide => ouvert
                            granted: allowed.length === 0 || allowed.some((r) => userRoleIds.includes(String(r))),
                        },
                    },
                },
            },
        }, { new: true });
        const rows = await CaseModel_1.default.aggregate(aggregateCaseWithStages({ _id: updated._id }));
        return res.status(200).json({ success: rows[0] });
    }
    catch {
        return fail(res, 500, "Changement de statut impossible");
    }
};
exports.setStageStatus = setStageStatus;
/* =========================================================
   POST /api/cases/:id/delivery
   body: { status: "pending"|"scheduled"|"delivered"|"returned", date? }
========================================================= */
const setDeliveryStatus = async (req, res) => {
    try {
        const { status, date } = req.body || {};
        if (!status)
            return fail(res, 300, "status requis");
        const patch = { "delivery.status": status };
        if (date !== undefined)
            patch["delivery.date"] = date ? new Date(date) : undefined;
        const c = await CaseModel_1.default.findByIdAndUpdate(req.params.id, { $set: patch }, { new: true });
        if (!c)
            return fail(res, 404, "Dossier introuvable");
        const rows = await CaseModel_1.default.aggregate(aggregateCaseWithStages({ _id: c._id }));
        return res.status(200).json({ success: rows[0] });
    }
    catch {
        return fail(res, 500, "Maj livraison impossible");
    }
};
exports.setDeliveryStatus = setDeliveryStatus;
/* =========================================================
   POST /api/cases/:id/approve
   body: { approved: boolean, by?: userId, note?: string }
========================================================= */
// export const approveCase = async (req: Request, res: Response) => {
//   try {
//     const { approved, by, note } = req.body || {};
//     const now = new Date();
//     const c = await CaseModel.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: {
//           "caseApproval.approved": !!approved,
//           "caseApproval.by": by ? asId(String(by)) : undefined,
//           "caseApproval.at": approved ? now : undefined,
//           "caseApproval.note": note,
//         },
//         $push: {
//           auditTrail: {
//             at: now,
//             actorRole: "LAB",
//             action: "approve",
//             meta: { approved: !!approved, by: by || null },
//           },
//         },
//       },
//       { new: true }
//     );
//     if (!c) return fail(res, 404, "Dossier introuvable");
//     const rows = await CaseModel.aggregate(aggregateCaseWithStages({ _id: c._id }));
//     return res.status(200).json({ success: rows[0] });
//   } catch {
//     return fail(res, 500, "Approbation impossible");
//   }
// };
const approveCase = async (req, res) => {
    try {
        const { approved, by, note } = req.body || {};
        const now = new Date();
        // 1) Récupération du dossier
        const existing = await CaseModel_1.default.findById(req.params.id).lean();
        if (!existing)
            return fail(res, 404, "Dossier introuvable");
        const stages = Array.isArray(existing.stages) ? existing.stages : [];
        const allDone = stages.length === 0
            ? true
            : stages.every((s) => String(s?.status).toLowerCase() === "done" && !!s?.completedAt);
        // 2) Préparer la mise à jour des étapes si nécessaire
        let stagesUpdate;
        let actorRole = "LAB";
        if (!allDone) {
            actorRole = "DOCTOR"; // "Médecin" si on force la complétion
            stagesUpdate = stages.map((s) => {
                const completedAt = s.completedAt ? new Date(s.completedAt) : now;
                const startedAt = s.startedAt ? new Date(s.startedAt) : completedAt;
                return {
                    ...s,
                    status: "done",
                    startedAt,
                    completedAt,
                };
            });
        }
        else {
            actorRole = "LAB"; // tout était déjà done
        }
        // 3) Auto "delivered" si approved et non "returned"
        const deliverySet = {};
        const currentDelivery = String(existing?.delivery?.status || "").toLowerCase();
        if (approved && currentDelivery !== "returned") {
            deliverySet["delivery.status"] = "delivered";
            if (!existing?.delivery?.date)
                deliverySet["delivery.date"] = now;
        }
        // 4) Build $set
        const set = {
            currentStageOrder: stages.length,
            "caseApproval.approved": !!approved,
            "caseApproval.note": note,
            "caseApproval.at": approved ? now : null,
            ...(by ? { "caseApproval.by": asId(String(by)) } : {}),
            ...(stagesUpdate ? { stages: stagesUpdate } : {}),
            ...deliverySet,
        };
        // 5) Update + audit
        const updated = await CaseModel_1.default.findByIdAndUpdate(existing._id, {
            $set: set,
            $push: {
                auditTrail: {
                    at: now,
                    actorRole, // "DOCTOR" si auto-completion, sinon "LAB"
                    action: "approve",
                    meta: {
                        approved: !!approved,
                        by: by || null,
                        stagesAutoCompleted: !allDone,
                        stagesCount: stages.length,
                        deliveryAutoUpdated: !!deliverySet["delivery.status"],
                    },
                },
            },
        }, { new: true });
        if (!updated)
            return fail(res, 404, "Dossier introuvable");
        const rows = await CaseModel_1.default.aggregate(aggregateCaseWithStages({ _id: updated._id }));
        return res.status(200).json({ success: rows[0] });
    }
    catch (err) {
        console.error("approveCase error:", err);
        return fail(res, 500, "Approbation impossible");
    }
};
exports.approveCase = approveCase;
/* =========================================================
   POST /api/cases/:id/attachments
   body: { url, name?, mime?, size?, uploadedBy? }
   (يتوافق مع CaseModel: {url, name, mime, size, uploadedBy, at})
========================================================= */
const addAttachment = async (req, res) => {
    try {
        const { url, name, mime, size, uploadedBy } = req.body || {};
        if (!url)
            return fail(res, 300, "URL requise");
        const doc = await CaseModel_1.default.findByIdAndUpdate(req.params.id, {
            $push: {
                attachments: {
                    url,
                    name,
                    mime,
                    size,
                    uploadedBy: uploadedBy ? asId(String(uploadedBy)) : undefined,
                    at: new Date(),
                },
            },
        }, { new: true });
        if (!doc)
            return fail(res, 404, "Dossier introuvable");
        const rows = await CaseModel_1.default.aggregate(aggregateCaseWithStages({ _id: doc._id }));
        return res.status(200).json({ success: rows[0] });
    }
    catch {
        return fail(res, 500, "Ajout pièce jointe impossible");
    }
};
exports.addAttachment = addAttachment;
/* =========================================================
   DELETE /api/cases/:id/attachments/:attachmentId
========================================================= */
const removeAttachment = async (req, res) => {
    try {
        const attachmentId = req.params.attachmentId;
        if (!mongoose_1.default.isValidObjectId(attachmentId))
            return fail(res, 300, "attachmentId invalide");
        const c = await CaseModel_1.default.findByIdAndUpdate(req.params.id, { $pull: { attachments: { _id: new mongoose_1.default.Types.ObjectId(attachmentId) } } }, { new: true });
        if (!c)
            return fail(res, 404, "Dossier introuvable");
        const rows = await CaseModel_1.default.aggregate(aggregateCaseWithStages({ _id: c._id }));
        return res.status(200).json({ success: rows[0] });
    }
    catch {
        return fail(res, 500, "Suppression pièce jointe impossible");
    }
};
exports.removeAttachment = removeAttachment;
//# sourceMappingURL=CaseController.js.map