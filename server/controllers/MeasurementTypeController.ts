// server/controllers/MeasurementTypeController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import MeasurementTypeModel, { StageTemplate } from "../models/MeasurementTypeModel";
import CaseModel from "../models/CaseModel";

const toPosInt: any = (raw: any, def = 1, max = 1_000_000) => {
  const n = parseInt(String(raw ?? ""), 10);
  if (Number.isNaN(n) || n < 1) return def;
  return Math.min(n, max);
};
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validateStageList = (stages: StageTemplate[] = []) => {
  const keys = new Set<string>();
  for (const s of stages) {
    if (!s.key?.trim()) return "Chaque étape doit avoir un 'key'.";
    if (keys.has(s.key)) return `Étape en double: '${s.key}'.`;
    keys.add(s.key);
    if (!s.name?.trim()) return `L'étape '${s.key}' doit avoir un nom.`;
    if (typeof s.order !== "number" || s.order < 1)
      return `L'étape '${s.key}' a un 'order' invalide.`;
  }
  return null;
};

const normalizeStages = (stages: StageTemplate[] = []) =>
  stages.map((s, i) => ({
    key: s.key?.trim(),
    name: s.name?.trim(),
    order: typeof s.order === "number" && s.order >= 1 ? s.order : i + 1,
    color: s.color?.trim(),
  })) as StageTemplate[];

export const listMeasurementTypes = async (req: Request, res: Response) => {
  try {
    const { q, page: pageRaw, limit: limitRaw } = req.query as {
      q?: string;
      page?: string;
      limit?: string;
    };
    const page = toPosInt(pageRaw, 1);
    const limit = toPosInt(limitRaw, 10, 100);
    const skip = (page - 1) * limit;

    const and: any[] = [];
    if (q?.trim()) {
      const rx = new RegExp(escapeRegex(q.trim()), "i");
      and.push({
        $or: [{ key: rx }, { name: rx }, { "stages.name": rx }, { "stages.key": rx }],
      });
    }
    const filter = and.length ? { $and: and } : {};

    const [total, items] = await Promise.all([
      MeasurementTypeModel.countDocuments(filter),
      MeasurementTypeModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
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
  } catch (e: any) {
    return res.status(500).json({ err: e.message });
  }
};

export const createMeasurementType = async (req: Request, res: Response) => {
  try {
    const { key, name, stages = [] } = req.body as {
      key: string;
      name: string;
      stages?: StageTemplate[];
    };
    if (!key?.trim() || !name?.trim())
      return res.status(400).json({ formErrors: ["'key' et 'name' sont obligatoires."] });

    const normalized = normalizeStages(stages);
    const err = validateStageList(normalized);
    if (err) return res.status(400).json({ formErrors: [err] });

    const exists = await MeasurementTypeModel.findOne({ key });
    if (exists) return res.status(400).json({ formErrors: [`'key' déjà utilisé: ${key}`] });

    const created = await MeasurementTypeModel.create({ key, name, stages: normalized });
    if (!created) return res.status(400).json({ formErrors: ["Création échouée."] });

    return listMeasurementTypes(req, res);
  } catch (e: any) {
    return res.status(500).json({ err: e.message });
  }
};

/**
 * IMPORTANT: لا نستبدل stages بالكامل حتى لا نخسر _id (المراجع من Case).
 * - إن أُرسلت stages: نحدّث الموجودة حسب key (نُبقي _id كما هو)،
 *   ونضيف فقط المراحل الجديدة (keys غير الموجودة).
 * - لا نحذف المراحل الغائبة هنا؛ الحذف يتم عبر removeStage (مع فحص الاستعمال في Case).
 */
export const updateMeasurementType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, stages } = req.body as { name?: string; stages?: StageTemplate[] };

    const doc = await MeasurementTypeModel.findById(id);
    if (!doc) return res.status(404).json({ formErrors: ["Type non trouvé."] });

    if (typeof name === "string") doc.name = name.trim();

    if (Array.isArray(stages)) {
      const normalized = normalizeStages(stages);
      const err = validateStageList(normalized);
      if (err) return res.status(400).json({ formErrors: [err] });

      // خريطة الموجودين بحسب key للحفاظ على _id
      const existingByKey = new Map(doc.stages.map((s) => [s.key, s]));

      // تحديث/إضافة بدون حذف
      for (const s of normalized) {
        const exists = existingByKey.get(s.key);
        if (exists) {
          exists.name = s.name;
          exists.color = s.color;
          exists.order = s.order;
        } else {
          doc.stages.push({
            key: s.key,
            name: s.name,
            color: s.color,
            order: s.order,
          } as any);
        }
      }

      // إعادة ترتيب 1..N
      doc.stages = [...doc.stages]
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((s: any, i: number) => ({ ...s, order: i + 1 })) as any;
    }

    await doc.save();
    return listMeasurementTypes(req, res);
  } catch (e: any) {
    return res.status(500).json({ err: e.message });
  }
};

export const deleteMeasurementType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    // امنع الحذف إذا هناك Cases تعتمد هذا النوع
    const usedCount = await CaseModel.countDocuments({ type: new mongoose.Types.ObjectId(id) });
    if (usedCount > 0) {
      return res
        .status(400)
        .json({
          formErrors: [
            `Impossible de supprimer: ${usedCount} dossier(s) utilisent ce type.`,
          ],
        });
    }

    const deleted = await MeasurementTypeModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ formErrors: ["Type non trouvé."] });
    return listMeasurementTypes(req, res);
  } catch (e: any) {
    return res.status(500).json({ err: e.message });
  }
};

/** === Actions ciblées sur stages === */

export const addStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { stage } = req.body as { stage: StageTemplate };
    if (!stage?.key?.trim() || !stage?.name?.trim())
      return res.status(400).json({ formErrors: ["Étape invalide."] });

    const doc = await MeasurementTypeModel.findById(id);
    if (!doc) return res.status(404).json({ formErrors: ["Type non trouvé."] });

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
    } as any);

    // إعادة ترقيم 1..N
    doc.stages = [...doc.stages]
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      .map((s: any, i: number) => ({ ...s, order: i + 1 })) as any;

    await doc.save();
    return listMeasurementTypes(req, res);
  } catch (e: any) {
    return res.status(500).json({ err: e.message });
  }
};

/**
 * updateStage يدعم تغيير key أيضاً (مع التحقق من التفرد)
 * params: :id, :stageKey (القديمة)
 * body: { name?, color?, order?, key? }
 */
export const updateStage = async (req: Request, res: Response) => {
  try {
    const { id, stageKey } = req.params as { id: string; stageKey: string };
    const { name, color, order, key } = req.body as Partial<StageTemplate>;

    const doc = await MeasurementTypeModel.findById(id);
    if (!doc) return res.status(404).json({ formErrors: ["Type non trouvé."] });

    const idx = doc.stages.findIndex((s) => s.key === stageKey);
    if (idx < 0) return res.status(404).json({ formErrors: ["Étape non trouvée."] });

    // لو طلب تغيير key، تحقق التفرد
    if (typeof key === "string" && key.trim() && key.trim() !== stageKey) {
      if (doc.stages.some((s, i) => i !== idx && s.key === key.trim())) {
        return res.status(400).json({ formErrors: [`'key' déjà utilisé: ${key.trim()}`] });
      }
      doc.stages[idx].key = key.trim();
    }

    if (typeof name === "string") doc.stages[idx].name = name.trim();
    if (typeof color === "string") doc.stages[idx].color = color.trim();
    if (typeof order === "number" && order >= 1) doc.stages[idx].order = order;

    // إعادة الترتيب 1..N
    doc.stages = [...doc.stages]
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      .map((s: any, i: number) => ({ ...s, order: i + 1 })) as any;

    await doc.save();
    return listMeasurementTypes(req, res);
  } catch (e: any) {
    return res.status(500).json({ err: e.message });
  }
};

/**
 * removeStage:
 *  - يحذف المرحلة حسب الـ key
 *  - إن كانت مستخدمة داخل Cases: يعيد خطأ مع العدد، إلا لو force=true
 *  - force: يسحب المرجع من كل Case مناسب ويعدّل currentStageOrder + auditTrail
 */
export const removeStage = async (req: Request, res: Response) => {
  try {
    const { id, stageKey } = req.params as { id: string; stageKey: string };
    const { force } = req.query as { force?: string };

    const doc = await MeasurementTypeModel.findById(id);
    if (!doc) return res.status(404).json({ formErrors: ["Type non trouvé."] });

    const idx = doc.stages.findIndex((s) => s.key === stageKey);
    if (idx < 0) return res.status(404).json({ formErrors: ["Étape non trouvée."] });

    const stageId = doc.stages[idx]._id as any as mongoose.Types.ObjectId;
    const stageOrder = doc.stages[idx].order;

    const usedCount = await CaseModel.countDocuments({
      type: new mongoose.Types.ObjectId(id),
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
    doc.stages = doc.stages.map((s: any, i: number) => ({ ...s, order: i + 1 })) as any;
    await doc.save();

    if (usedCount > 0) {
      // نظّف الحالات المتأثرة: اسحب المرحلة من المصفوفة واضبط currentStageOrder
      const affected = await CaseModel.find({
        type: new mongoose.Types.ObjectId(id),
        "stages.stage": stageId,
      });

      const now = new Date();

      for (const c of affected) {
        // اسحب المرجع من stages
        c.stages = (c.stages as any[]).filter((s) => String(s.stage) !== String(stageId)) as any;

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
          c.delivery = { status: "pending" as const };
        } else if ((c.currentStageOrder || 0) >= totalAfter) {
          c.delivery.status = "delivered";
          c.delivery.date = c.delivery.date || now;
        } else if ((c.currentStageOrder || 0) === totalAfter - 1) {
          c.delivery.status = "scheduled";
          c.delivery.date = undefined;
        } else {
          c.delivery.status = "pending";
          c.delivery.date = undefined;
        }

        // أثر
        (c.auditTrail as any[]).push({
          actorRole: "SYSTEM",
          action: "stage_removed",
          at: now,
          meta: { stageKey, stageId, reason: "force_delete_from_type" },
        });

        await c.save();
      }
    }

    return listMeasurementTypes(req, res);
  } catch (e: any) {
    return res.status(500).json({ err: e.message });
  }
};
