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
const isValidObjectId = (v?: any) => typeof v === "string" && mongoose.Types.ObjectId.isValid(v);

/** ===== Stages validation & normalization (no more 'key') ===== */
type IncomingStage = Partial<StageTemplate> & {
  _id?: any;
  name?: string;
  order?: number;
  color?: string;
  allowedRoles?: any[];
};

const validateStageList = (stages: IncomingStage[] = []) => {
  for (const s of stages) {
    if (!s.name?.trim()) return `Chaque étape doit avoir un 'name'.`;
    if (typeof s.order !== "number" || s.order < 1) return `L'étape '${s.name}' a un 'order' invalide (>= 1).`;
    if (s.allowedRoles) {
      if (!Array.isArray(s.allowedRoles)) return `allowedRoles doit être un tableau.`;
      for (const r of s.allowedRoles) {
        if (!isValidObjectId(String(r))) return `allowedRoles contient un ObjectId invalide.`;
      }
    }
  }
  return null;
};

const normalizeStages = (stages: IncomingStage[] = []) =>
  stages.map((s, i) => ({
    _id: isValidObjectId(String(s._id)) ? new mongoose.Types.ObjectId(String(s._id)) : undefined,
    name: s.name?.trim(),
    order: typeof s.order === "number" && s.order >= 1 ? s.order : i + 1,
    color: s.color?.trim(),
    allowedRoles: Array.isArray(s.allowedRoles)
      ? s.allowedRoles.map((r) => new mongoose.Types.ObjectId(String(r)))
      : [],
  })) as IncomingStage[];

/** ===== List ===== */
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
        $or: [{ key: rx }, { name: rx }, { "stages.name": rx }],
      });
    }
    const filter = and.length ? { $and: and } : {};

    const [total, items] = await Promise.all([
      MeasurementTypeModel.countDocuments(filter),
      MeasurementTypeModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
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
  } catch (e: any) {
    return res.status(500).json({ err: e.message });
  }
};

/** ===== Create ===== */
export const createMeasurementType = async (req: Request, res: Response) => {
  try {
    const { key, name, stages = [] } = req.body as {
      key: string;
      name: string;
      stages?: IncomingStage[];
    };

    if (!key?.trim() || !name?.trim())
      return res.status(400).json({ formErrors: ["'key' et 'name' sont obligatoires."] });

    const normalized = normalizeStages(stages);
    const err = validateStageList(normalized);
    if (err) return res.status(400).json({ formErrors: [err] });

    const exists = await MeasurementTypeModel.findOne({ key });
    if (exists) return res.status(400).json({ formErrors: [`'key' déjà utilisé: ${key}`] });

    const created = await MeasurementTypeModel.create({
      key,
      name,
      stages: normalized.map((s) => ({
        name: s.name!,
        color: s.color,
        order: s.order!,
        allowedRoles: s.allowedRoles || [],
      })),
    });
    if (!created) return res.status(400).json({ formErrors: ["Création échouée."] });

    return listMeasurementTypes(req, res);
  } catch (e: any) {
    return res.status(500).json({ err: e.message });
  }
};

/**
 * IMPORTANT:
 * - We DO NOT replace the whole 'stages' array to preserve existing _id (referenced by Case).
 * - If 'stages' sent: update existing ones by _id; add only new ones (no delete here).
 * - Deletions happen via removeStage (with Case usage checks).
 */
export const updateMeasurementType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, stages } = req.body as { name?: string; stages?: IncomingStage[] };

    const doc = await MeasurementTypeModel.findById(id);
    if (!doc) return res.status(404).json({ formErrors: ["Type non trouvé."] });

    if (typeof name === "string") doc.name = name.trim();

    if (Array.isArray(stages)) {
      const normalized = normalizeStages(stages);
      const err = validateStageList(normalized);
      if (err) return res.status(400).json({ formErrors: [err] });

      // Map existing by _id (string)
      const existingById = new Map(doc.stages.map((s: any) => [String(s._id), s]));

      for (const s of normalized) {
        if (s._id && existingById.has(String(s._id))) {
          // update in place
          const tgt: any = existingById.get(String(s._id));
          tgt.name = s.name;
          tgt.color = s.color;
          tgt.order = s.order;
          if (Array.isArray(s.allowedRoles)) {
            tgt.allowedRoles = s.allowedRoles;
          }
        } else {
          // add new stage
          doc.stages.push({
            name: s.name!,
            color: s.color,
            order: s.order!,
            allowedRoles: s.allowedRoles || [],
          } as any);
        }
      }

      // Reorder 1..N
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

/** ===== Delete Type (unchanged) ===== */
export const deleteMeasurementType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const usedCount = await CaseModel.countDocuments({ type: new mongoose.Types.ObjectId(id) });
    if (usedCount > 0) {
      return res.status(400).json({
        formErrors: [`Impossible de supprimer: ${usedCount} dossier(s) utilisent ce type.`],
      });
    }

    const deleted = await MeasurementTypeModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ formErrors: ["Type non trouvé."] });
    return listMeasurementTypes(req, res);
  } catch (e: any) {
    return res.status(500).json({ err: e.message });
  }
};

/** ===== Stages actions (now use :stageId) ===== */

/** Add a stage (no key anymore) */
export const addStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { stage } = req.body as { stage: IncomingStage };

    if (!stage?.name?.trim()) return res.status(400).json({ formErrors: ["Étape invalide: 'name' requis."] });

    const doc = await MeasurementTypeModel.findById(id);
    if (!doc) return res.status(404).json({ formErrors: ["Type non trouvé."] });

    const maxOrder = doc.stages.reduce((m: number, s: any) => Math.max(m, s.order || 0), 0);
    const allowedRoles = Array.isArray(stage.allowedRoles)
      ? stage.allowedRoles.map((r) => new mongoose.Types.ObjectId(String(r)))
      : [];

    doc.stages.push({
      name: stage.name.trim(),
      color: stage.color?.trim(),
      order: typeof stage.order === "number" && stage.order > 0 ? stage.order : maxOrder + 1,
      allowedRoles,
    } as any);

    // Reorder 1..N
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
 * Update a stage by :stageId
 * params: :id, :stageId
 * body: { name?, color?, order?, allowedRoles? }
 */
export const updateStage = async (req: Request, res: Response) => {
  try {
    const { id, stageId } = req.params as { id: string; stageId: string };
    const { name, color, order, allowedRoles } = req.body as Partial<IncomingStage>;

    if (!isValidObjectId(stageId)) return res.status(400).json({ formErrors: ["stageId invalide."] });

    const doc = await MeasurementTypeModel.findById(id);
    if (!doc) return res.status(404).json({ formErrors: ["Type non trouvé."] });

    const idx = doc.stages.findIndex((s: any) => String(s._id) === String(stageId));
    if (idx < 0) return res.status(404).json({ formErrors: ["Étape non trouvée."] });

    if (typeof name === "string") doc.stages[idx].name = name.trim();
    if (typeof color === "string") doc.stages[idx].color = color.trim();
    if (typeof order === "number" && order >= 1) doc.stages[idx].order = order;
    if (Array.isArray(allowedRoles)) {
      const mapped = allowedRoles.map((r) => {
        if (!isValidObjectId(String(r))) throw new Error("ObjectId invalide dans allowedRoles.");
        return new mongoose.Types.ObjectId(String(r));
      });
      (doc.stages as any)[idx].allowedRoles = mapped;
    }

    // Reorder 1..N
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
 * removeStage by :stageId
 * - If used in Cases: returns error with count unless force=true
 * - If force=true: cleans up cases and adjusts currentStageOrder + delivery
 */
export const removeStage = async (req: Request, res: Response) => {
  try {
    const { id, stageId } = req.params as { id: string; stageId: string };
    const { force } = req.query as { force?: string };

    if (!isValidObjectId(stageId)) return res.status(400).json({ formErrors: ["stageId invalide."] });

    const doc = await MeasurementTypeModel.findById(id);
    if (!doc) return res.status(404).json({ formErrors: ["Type non trouvé."] });

    const idx = doc.stages.findIndex((s: any) => String(s._id) === String(stageId));
    if (idx < 0) return res.status(404).json({ formErrors: ["Étape non trouvée."] });

    const stageObjectId = doc.stages[idx]._id as any as mongoose.Types.ObjectId;
    const stageOrder = (doc.stages as any)[idx].order;

    const usedCount = await CaseModel.countDocuments({
      type: new mongoose.Types.ObjectId(id),
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
    (doc.stages as any).splice(idx, 1);
    doc.stages = (doc.stages as any).map((s: any, i: number) => ({ ...s, order: i + 1 })) as any;
    await doc.save();

    if (usedCount > 0) {
      const affected = await CaseModel.find({
        type: new mongoose.Types.ObjectId(id),
        "stages.stage": stageObjectId,
      });

      const now = new Date();

      for (const c of affected) {
        // remove stage ref from case
        c.stages = (c.stages as any[]).filter((s) => String(s.stage) !== String(stageObjectId)) as any;

        // adjust currentStageOrder
        if ((c.currentStageOrder || 0) >= stageOrder) {
          const totalAfter = doc.stages.length;
          c.currentStageOrder = Math.min(c.currentStageOrder || 0, totalAfter);
        }

        // delivery recalculation
        const totalAfter = doc.stages.length;
        if (totalAfter === 0) {
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

        // audit trail
        (c.auditTrail as any[]).push({
          actorRole: "SYSTEM",
          action: "stage_removed",
          at: now,
          meta: { stageId, reason: "force_delete_from_type" },
        });

        await c.save();
      }
    }

    return listMeasurementTypes(req, res);
  } catch (e: any) {
    return res.status(500).json({ err: e.message });
  }
};
