// server/controllers/PermissionController.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import PermissionModel, { PermissionDoc } from "../models/PermissionModel";
import UserModel from "../models/UserModel";

/**
 * GET /permissions
 * - بدون userId: يرجّع كل الصلاحيات (أحدث أولاً)
 * - مع userId: يرجّع الصلاحيات الممنوحة للمستخدم (تفريد + ترتيب)
 */
export const getPermissions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query as { userId?: string };

    if (userId) {
      if (!Types.ObjectId.isValid(userId)) {
        return res.status(300).json(["userId غير صالح"]);
      }

      const user = await UserModel.findById(userId)
        .populate({
          path: "roles",
          populate: { path: "permissions", model: "permission" },
        })
        .lean();

      if (!user) {
        return res.status(300).json(["Utilisateur introuvable"]);
      }

      // تفريد الصلاحيات عبر Set على _id
      const seen = new Set<string>();
      const userPerms: PermissionDoc[] = [];

      for (const role of (user.roles as any[]) || []) {
        for (const p of (role.permissions as any[]) || []) {
          const id = String(p._id);
          if (!seen.has(id)) {
            seen.add(id);
            userPerms.push(p);
          }
        }
      }

      // ترتيب تنازلياً حسب createdAt
      userPerms.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return res.status(200).json({ success: userPerms });
    }

    // بدون userId: كل الصلاحيات
    const all = await PermissionModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: all });
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

/**
 * GET /permissions/by-table
 * تجميع الصلاحيات حسب collectionName، مع ترتيب داخلي حسب createdAt desc
 */
export const getPermissionsByTable = async (req: Request, res: Response) => {
  try {
    const result = await PermissionModel.aggregate([
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
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

/**
 * POST /permissions
 * إنشاء صلاحية واحدة
 */
export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name = "", collectionName = "" } = req.body as {
      name: string;
      collectionName: string;
    };

    const errors: string[] = [];
    if (!name.trim()) errors.push("Le nom du permission est obligatoire");
    if (!collectionName.trim())
      errors.push("Le nom de la collection est obligatoire");
    if (errors.length) return res.status(300).json(errors);

    const exists = await PermissionModel.findOne({ name, collectionName });
    if (exists) {
      return res.status(300).json(["Le permission existe déjà"]);
    }

    await PermissionModel.create({ name, collectionName });
    await getPermissions(req, res)

  } catch (err: any) {
    // احتمال Duplicate key بسبب unique index
    if (err?.code === 11000) {
      return res.status(300).json(["Le permission existe déjà"]);
    }
    return res.status(500).json({ err: err.message });
  }
};

/**
 * POST /permissions/bulk
 * إنشاء عدة صلاحيات دفعة واحدة بشكل آمن
 */
export const createManyPermission = async (req: Request, res: Response) => {
  try {
    const { permissions = [] } = req.body as {
      permissions: Array<{ name: string; collectionName: string }>;
    };

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
    const inserted = await PermissionModel.insertMany(docs, {
      ordered: false,
    }).catch(() => null);

    const all = await PermissionModel.find().sort({ createdAt: -1 });
    await getPermissions(req, res)

  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

/**
 * PUT /permissions/:id
 * تحديث صلاحية
 */
export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ errors: ["ID invalide"] });
    }

    let { name = "", collectionName = "" } = req.body as {
      name?: string;
      collectionName?: string;
    };

    // اجلب الأصل لاستكمال الحقول الفارغة
    const original = await PermissionModel.findById(id);
    if (!original) {
      return res.status(404).json({ errors: ["Permission introuvable"] });
    }

    name = name?.trim() || original.name;
    collectionName = collectionName?.trim() || original.collectionName;

    // تحقق من عدم وجود تكرار على سجل آخر
    const duplicate = await PermissionModel.findOne({
      _id: { $ne: id },
      name,
      collectionName,
    });
    if (duplicate) {
      return res.status(409).json({ errors: ["Le permission existe déjà"] });
    }

    const updated = await PermissionModel.findByIdAndUpdate(
      id,
      { $set: { name, collectionName } },
      { new: true }
    );

    await getPermissions(req, res)

  } catch (err: any) {
    // احتمال Duplicate key
    if (err?.code === 11000) {
      return res.status(409).json({ errors: ["Le permission existe déjà"] });
    }
    return res.status(500).json({ err: err.message });
  }
};

/**
 * DELETE /permissions/:id
 */
export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ errors: ["ID invalide"] });
    }
    await PermissionModel.deleteOne({ _id: id });
    await getPermissions(req, res)

  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

/**
 * DELETE /permissions
 * حذف كل الصلاحيات (استعمل بحذر)
 */
export const deleteAllPermission = async (_req: Request, res: Response) => {
  try {
    await PermissionModel.deleteMany();
    await getPermissions(_req, res)
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};
