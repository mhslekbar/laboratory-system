// server/controllers/CaseController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import CaseModel from "../models/CaseModel";
import MeasurementTypeModel from "../models/MeasurementTypeModel";

const fail = (res: Response, code = 400, msg = "Erreur") =>
  res.status(code).json({ error: msg });

type StageStatus = "pending" | "in_progress" | "done";

/* ======================= Helpers ======================= */

const toPosInt = (raw: any, def = 1, max = 1_000_000) => {
  const n = parseInt(String(raw ?? ""), 10);
  if (Number.isNaN(n) || n < 1) return def;
  return Math.min(n, max);
};

// تحويل نص إلى ObjectId إن أمكن
const asId = (v?: string) =>
  v && mongoose.isValidObjectId(v) ? new mongoose.Types.ObjectId(v) : undefined;

// جلب تفاصيل المراحل ديناميكياً + populate (patient, doctor[user], type)
const aggregateCaseWithStages = (match: any) => [
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
      // يمكنك استخدام pipeline لو أردت تقليص الحقول:
      // pipeline: [{ $project: { name: 1, phone: 1 } }],
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
      // pipeline: [{ $project: { username: 1, fullName: 1 } }],
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
                stage: "$$cs.stage",         // المرجع المخزّن (ObjectId)
                status: "$$cs.status",
                startedAt: "$$cs.startedAt",
                completedAt: "$$cs.completedAt",
                assignedTo: "$$cs.assignedTo",
                // قيم العرض من القالب
                key: "$$tpl.key",
                name: "$$tpl.name",
                order: "$$tpl.order",
                color: "$$tpl.color",
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


// البحث بالنص q على code و أسماء/مفاتيح المراحل (يتطلب ما بعد $lookup)
const buildSearchMatch = (q: string) => {
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  return {
    $or: [
      { code: rx },
      { "patient.name": rx },
      { "patient.phone": rx },
      { "doctor.username": rx },
      { "doctor.fullName": rx },
      { "type.key": rx },
      { "type.name": rx },
      { "stages.key": rx },
      { "stages.name": rx },
    ],
  };
};


// حل stageId من stageKey بالرجوع لقالب النوع
const resolveStageIdByKey = async (typeId: mongoose.Types.ObjectId, key: string) => {
  const mt = await MeasurementTypeModel.findById(typeId).lean();
  if (!mt) return undefined;
  const tpl = (mt.stages || []).find((s: any) => s.key === key);
  return tpl?._id as mongoose.Types.ObjectId | undefined;
};

// مولد كود بسيط (استبدله بعدّاد مركزي عند الحاجة)
async function nextCaseCode() {
  const count = await CaseModel.countDocuments();
  return `JOB-${String(count + 1).padStart(6, "0")}`;
}

/* =========================================================
   GET /api/cases?q=&doctorId=&patientId=&typeId=&status=&page=&limit=
   (يعيد المراحل مثراة بديناميكياً)
========================================================= */
export const listCases = async (req: Request, res: Response) => {
  try {
    const {
      q = "",
      doctorId,
      patientId,
      typeId,
      status, // delivery.status
      page = 1,
      limit = 10,
    } = req.query as Record<string, any>;

    const pageNum = toPosInt(page, 1);
    const limitNum = Math.min(200, toPosInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const match: any = {};
    if (doctorId) match.doctor = asId(String(doctorId));
    if (patientId) match.patient = asId(String(patientId));
    if (typeId) match.type = asId(String(typeId));
    if (status) match["delivery.status"] = String(status);

    const pipeline:any = [
      ...aggregateCaseWithStages(match),
      // تطبيق البحث النصي بعد الإثراء
      ...(q ? [{ $match: buildSearchMatch(q) }] : []),
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ];

    const [items, totalArr] = await Promise.all([
      CaseModel.aggregate(pipeline),
      CaseModel.aggregate([
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
  } catch (e) {
    return fail(res, 500, "Erreur lors du listing");
  }
};

/* =========================================================
   GET /api/cases/:id
========================================================= */
export const getCaseById = async (req: Request, res: Response) => {
  try {
    const _id = asId(req.params.id);
    if (!_id) return fail(res, 400, "ID invalide");

    const rows = await CaseModel.aggregate(aggregateCaseWithStages({ _id }));
    const c = rows[0];
    if (!c) return fail(res, 404, "Dossier introuvable");

    return res.status(200).json({ success: c });
  } catch {
    return fail(res, 500, "Erreur");
  }
};

/* =========================================================
   POST /api/cases  body: { code?, doctor, patient, type, note? }
   يبني stages من MeasurementType.stages كمراجع فقط
========================================================= */
export const createCase = async (req: Request, res: Response) => {
  try {
    const { code, doctor, patient, type, note } = req.body || {};
    if (!doctor || !patient || !type) return fail(res, 400, "doctor, patient, type requis");

    const typeDoc = await MeasurementTypeModel.findById(type).lean();
    
    if (!typeDoc) return fail(res, 400, "Type introuvable");

    const stages = (typeDoc.stages || [])
      .slice()
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      .map((tpl: any) => ({ stage: tpl._id, status: "pending" as StageStatus }));

    const caseCode = code || (await nextCaseCode());
    const now = new Date();

    const created = await CaseModel.create({
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

    // أعِد الوثيقة مُثرّاة
    const rows = await CaseModel.aggregate(aggregateCaseWithStages({ _id: created._id }));
    return res.status(201).json({ success: rows[0] });
  } catch (e) {
    console.log("e: ", e)
    return fail(res, 500, "Création impossible");
  }
};

/* =========================================================
   PUT /api/cases/:id  (champs simples)
========================================================= */
export const updateCase = async (req: Request, res: Response) => {
  try {
    const allowed = ["doctor", "patient", "type", "delivery", "caseApproval", "attachments", "note", "currentStageOrder"];
    const patch: any = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];

    const c = await CaseModel.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!c) return fail(res, 404, "Dossier introuvable");

    const rows = await CaseModel.aggregate(aggregateCaseWithStages({ _id: c._id }));
    return res.status(200).json({ success: rows[0] });
  } catch {
    return fail(res, 500, "Mise à jour impossible");
  }
};

/* =========================================================
   DELETE /api/cases/:id
========================================================= */
export const deleteCase = async (req: Request, res: Response) => {
  try {
    const c = await CaseModel.findByIdAndDelete(req.params.id);
    if (!c) return fail(res, 404, "Dossier introuvable");

    return res.status(200).json({ success: true });
  } catch {
    return fail(res, 500, "Suppression impossible");
  }
};

/* =========================================================
   POST /api/cases/:id/advance
   body: { toOrder?, toStageId?, toKey?, status? }
   - يحرك المؤشر إلى مرحلة مستهدفة
   - يحدّث حالات المراحل المحيطة
   - يضبط حالة التسليم وفق الموضع
========================================================= */
export const advanceStage = async (req: Request, res: Response) => {
  try {
    const { toOrder, toStageId, toKey, status }: { toOrder?: number; toStageId?: string; toKey?: string; status?: StageStatus } = req.body || {};
    const c: any = await CaseModel.findById(req.params.id).lean();
    if (!c) return fail(res, 404, "Dossier introuvable");
    if (!Array.isArray(c.stages) || c.stages.length === 0) return fail(res, 400, "Aucune étape");

    // حدّد order الهدف
    let targetOrder: number | undefined;

    if (typeof toOrder === "number") {
      targetOrder = toOrder;
    } else if (toStageId && mongoose.isValidObjectId(toStageId)) {
      // حوّل stageId -> order عبر نوع القياس
      const mt = await MeasurementTypeModel.findById(c.type).lean();
      const idx = (mt?.stages || []).find((s: any) => String(s._id) === String(toStageId))?.order;
      if (typeof idx === "number") targetOrder = idx;
    } else if (toKey) {
      const mt = await MeasurementTypeModel.findById(c.type).lean();
      const idx = (mt?.stages || []).find((s: any) => s.key === toKey)?.order;
      if (typeof idx === "number") targetOrder = idx;
    }

    if (typeof targetOrder !== "number") {
      // افتراضي: المرحلة التالية
      const mt = await MeasurementTypeModel.findById(c.type).lean();
      const total = (mt?.stages || []).length;
      targetOrder = Math.min((c.currentStageOrder || 0) + 1, total);
    }

    // تحقق من الحدود
    const mt = await MeasurementTypeModel.findById(c.type).lean();
    const total = (mt?.stages || []).length;
    if (!total) return fail(res, 400, "Type sans étapes");
    if (targetOrder < 1 || targetOrder > total) return fail(res, 400, `Ordre cible invalide (1..${total})`);

    // ابنِ خريطة order -> stageId لتحديث مصفوفة stages
    const orderToId = new Map<number, string>();
    (mt!.stages || []).forEach((s: any) => orderToId.set(s.order, String(s._id)));

    const now = new Date();
    const prevOrder = c.currentStageOrder || 0;

    // حدّث المصفوفة حسب order:
    // - قبل target: done
    // - بعد target: pending
    // - target: status (in_progress افتراضياً إن لم يُمرّر)
    const newStages = (c.stages as any[]).map((row: any) => {
      const stgId = String(row.stage);
      // احصل على order لهذه المرحلة
      const ord = [...orderToId.entries()].find(([, id]) => id === stgId)?.[0];

      if (!ord) return row;

      if (ord < targetOrder!) {
        return {
          ...row,
          status: "done",
          startedAt: row.startedAt || now,
          completedAt: row.completedAt || now,
        };
      } else if (ord > targetOrder!) {
        return {
          ...row,
          status: "pending",
          startedAt: undefined,
          completedAt: undefined,
        };
      } else {
        const desired = status || "in_progress";
        return {
          ...row,
          status: desired,
          startedAt: desired === "pending" ? undefined : row.startedAt || now,
          completedAt: desired === "done" ? now : undefined,
        };
      }
    });

    // ضبط حالة التسليم حسب الموضع (توافقاً مع enum: pending | scheduled | delivered | returned)
    const delivery: any = c.delivery || { status: "pending" };
    if (targetOrder === total) {
      delivery.status = "delivered";
      delivery.date = delivery.date || now;
    } else if (targetOrder === total - 1) {
      delivery.status = "scheduled";
      delivery.date = undefined;
    } else {
      delivery.status = "pending";
      delivery.date = undefined;
    }

    const updated = await CaseModel.findByIdAndUpdate(
      req.params.id,
      {
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
              by: toStageId
                ? { type: "stageId", value: toStageId }
                : toKey
                ? { type: "key", value: toKey }
                : toOrder
                ? { type: "order", value: toOrder }
                : { type: "autoNext", value: prevOrder + 1 },
              statusOverride: status || null,
            },
          },
        },
      },
      { new: true }
    );

    const rows = await CaseModel.aggregate(aggregateCaseWithStages({ _id: updated!._id }));
    return res.status(200).json({ success: rows[0] });
  } catch (e) {
    return fail(res, 500, "Transition impossible");
  }
};

/* =========================================================
   POST /api/cases/:id/stages/:stageIdOrKey/status
   body: { status, note? }
   - يدعم :stageIdOrKey كـ ObjectId أو key
========================================================= */
export const setStageStatus = async (req: Request, res: Response) => {
  try {
    const { status, note } = req.body as { status: StageStatus; note?: string };
    if (!status) return fail(res, 400, "status requis");

    const c: any = await CaseModel.findById(req.params.id).lean();
    if (!c) return fail(res, 404, "Dossier introuvable");

    let stageId: mongoose.Types.ObjectId | undefined;
    const raw = req.params.stageIdOrKey;

    if (mongoose.isValidObjectId(raw)) {
      stageId = new mongoose.Types.ObjectId(raw);
    } else {
      // حوّل key -> id
      stageId = await resolveStageIdByKey(c.type, raw);
      if (!stageId) return fail(res, 404, "Étape (par key) introuvable");
    }

    const now = new Date();

    const patched = (c.stages as any[]).map((row) => {
      if (String(row.stage) !== String(stageId)) return row;
      const next: any = { ...row, status };
      if (status === "in_progress") {
        next.startedAt = row.startedAt || now;
        next.completedAt = undefined;
      } else if (status === "done") {
        next.startedAt = row.startedAt || now;
        next.completedAt = now;
      } else {
        next.startedAt = undefined;
        next.completedAt = undefined;
      }
      if (note !== undefined) next.note = note; // إن كان لديك حقل note على مستوى المرحلة
      return next;
    });

    const updated = await CaseModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: { stages: patched },
        $push: {
          auditTrail: {
            at: now,
            actorRole: "LAB",
            action: "stage_status",
            meta: { stage: String(stageId), status },
          },
        },
      },
      { new: true }
    );

    const rows = await CaseModel.aggregate(aggregateCaseWithStages({ _id: updated!._id }));
    return res.status(200).json({ success: rows[0] });
  } catch {
    return fail(res, 500, "Changement de statut impossible");
  }
};

/* =========================================================
   POST /api/cases/:id/delivery
   body: { status: "pending"|"scheduled"|"delivered"|"returned", date? }
========================================================= */
export const setDeliveryStatus = async (req: Request, res: Response) => {
  try {
    const { status, date } = req.body || {};
    if (!status) return fail(res, 400, "status requis");

    const patch: any = { "delivery.status": status };
    if (date !== undefined) patch["delivery.date"] = date ? new Date(date) : undefined;

    const c = await CaseModel.findByIdAndUpdate(req.params.id, { $set: patch }, { new: true });
    if (!c) return fail(res, 404, "Dossier introuvable");

    const rows = await CaseModel.aggregate(aggregateCaseWithStages({ _id: c._id }));
    return res.status(200).json({ success: rows[0] });
  } catch {
    return fail(res, 500, "Maj livraison impossible");
  }
};

/* =========================================================
   POST /api/cases/:id/approve
   body: { approved: boolean, by?: userId, note?: string }
========================================================= */
export const approveCase = async (req: Request, res: Response) => {
  try {
    const { approved, by, note } = req.body || {};
    const now = new Date();

    const c = await CaseModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "caseApproval.approved": !!approved,
          "caseApproval.by": by ? asId(String(by)) : undefined,
          "caseApproval.at": approved ? now : undefined,
          "caseApproval.note": note,
        },
        $push: {
          auditTrail: {
            at: now,
            actorRole: "LAB",
            action: "approve",
            meta: { approved: !!approved, by: by || null },
          },
        },
      },
      { new: true }
    );
    if (!c) return fail(res, 404, "Dossier introuvable");

    const rows = await CaseModel.aggregate(aggregateCaseWithStages({ _id: c._id }));
    return res.status(200).json({ success: rows[0] });
  } catch {
    return fail(res, 500, "Approbation impossible");
  }
};

/* =========================================================
   POST /api/cases/:id/attachments
   body: { url, name?, mime?, size?, uploadedBy? }
   (يتوافق مع CaseModel: {url, name, mime, size, uploadedBy, at})
========================================================= */
export const addAttachment = async (req: Request, res: Response) => {
  try {
    const { url, name, mime, size, uploadedBy } = req.body || {};
    if (!url) return fail(res, 400, "URL requise");

    const doc = await CaseModel.findByIdAndUpdate(
      req.params.id,
      {
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
      },
      { new: true }
    );
    if (!doc) return fail(res, 404, "Dossier introuvable");

    const rows = await CaseModel.aggregate(aggregateCaseWithStages({ _id: doc._id }));
    return res.status(200).json({ success: rows[0] });
  } catch {
    return fail(res, 500, "Ajout pièce jointe impossible");
  }
};

/* =========================================================
   DELETE /api/cases/:id/attachments/:attachmentId
========================================================= */
export const removeAttachment = async (req: Request, res: Response) => {
  try {
    const attachmentId = req.params.attachmentId;
    if (!mongoose.isValidObjectId(attachmentId)) return fail(res, 400, "attachmentId invalide");

    const c = await CaseModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { attachments: { _id: new mongoose.Types.ObjectId(attachmentId) } } },
      { new: true }
    );
    if (!c) return fail(res, 404, "Dossier introuvable");

    const rows = await CaseModel.aggregate(aggregateCaseWithStages({ _id: c._id }));
    return res.status(200).json({ success: rows[0] });
  } catch {
    return fail(res, 500, "Suppression pièce jointe impossible");
  }
};
