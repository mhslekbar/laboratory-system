// server/controllers/RoleController.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import RoleModel from "../models/RoleModel";
import UserModel from "../models/UserModel";

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /roles
export const getRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await RoleModel.find({})
      .populate({ path: "permissions", model: "permission" })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: roles });
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

// POST /roles
export const createRole = async (req: Request, res: Response) => {
  try {
    let { name = "", permissions = [] } = req.body as {
      name: string;
      permissions?: string[];
    };

    name = name.trim();

    const errors: string[] = [];
    if (!name) errors.push("Le nom du rôle est obligatoire");
    if (name.length < 3) errors.push("Le nom du rôle doit contenir au moins 3 caractères");
    if (errors.length) return res.status(300).json(errors);

    // فحص تكرار الاسم (غير حساس لحالة الأحرف)
    const duplicate = await RoleModel.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
    });
    if (duplicate) return res.status(300).json(["Le nom existe déjà"]);

    // تأكد من أن permissions مصفوفة ObjectId صالحة
    const permIds = Array.isArray(permissions)
      ? permissions.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id))
      : [];

    const created = await RoleModel.create({ name, permissions: permIds });
    const populated = await RoleModel.findById(created._id)
      .populate({ path: "permissions", model: "permission" });

    await getRoles(req, res)
  } catch (err: any) {
    if (err?.code === 11000) return res.status(300).json(["Le nom existe déjà"]);
    return res.status(500).json({ err: err.message });
  }
};

// PUT /roles/:id
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ errors: ["ID invalide"] });

    const original = await RoleModel.findById(id);
    if (!original) return res.status(404).json({ errors: ["Rôle introuvable"] });

    let { name = "", permissions } = req.body as { name?: string; permissions?: string[] };

    name = (name ?? "").trim() || original.name;

    const errors: string[] = [];
    if (!name) errors.push("Le nom du rôle est obligatoire");
    if (name.length < 3) errors.push("Le nom du rôle doit contenir au moins 3 caractères");
    if (errors.length) return res.status(300).json(errors);

    // منع تكرار الاسم على أدوار أخرى (case-insensitive)
    const exists = await RoleModel.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
    });
    if (exists) return res.status(300).json(["Le nom existe déjà"]);

    let permIds: Types.ObjectId[] | undefined = undefined;
    if (permissions !== undefined) {
      permIds = Array.isArray(permissions)
        ? permissions.filter((p) => Types.ObjectId.isValid(p)).map((p) => new Types.ObjectId(p))
        : [];
    }

    await RoleModel.updateOne(
      { _id: id },
      { $set: { name, ...(permIds ? { permissions: permIds } : {}) } }
    );

    const updated = await RoleModel.findById(id)
      .populate({ path: "permissions", model: "permission" });

    await getRoles(req, res)

  } catch (err: any) {
    if (err?.code === 11000) return res.status(300).json(["Le nom existe déjà"]);
    return res.status(500).json({ err: err.message });
  }
};

// DELETE /roles/:id
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!Types.ObjectId.isValid(id)) return res.status(300).json(["ID invalide"]);

    // أزل الدور من جميع المستخدمين بكود واحد (بدل map + await داخلها)
    await UserModel.updateMany({ roles: id }, { $pull: { roles: id } });

    await RoleModel.deleteOne({ _id: id });

    await getRoles(req, res)

  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};
