// server/controllers/UserController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import UserModel, { UserInterface } from "../models/UserModel";

/* ----------------------------- helpers ----------------------------- */
const sanitize = (u: UserInterface) => ({
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
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toPosInt = (v: any, fallback: number, max = 100) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), max) : fallback;
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { q, page: pageRaw, limit: limitRaw } = req.query as {
      q?: string; page?: string; limit?: string;
    };

    // 1) Normaliser ONLY (all/users/doctors), insensible à la casse, défaut = 'all'
    const onlyRaw = String((req.query as any).only ?? "all").toLowerCase();
    const only: "all" | "users" | "doctors" =
      onlyRaw === "users" || onlyRaw === "doctors" ? onlyRaw : "all";

    // 2) Construire le filtre via un $and cumulatif (plus sûr)
    const and: any[] = [];

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
    } else if (only === "users") {
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
        UserModel.countDocuments(filter),
        UserModel.find(filter, { passwordHash: 0 })
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
    const users = await UserModel.find(filter, { passwordHash: 0 })
      .sort({ createdAt: -1 })
      .populate("roles")
      .lean();

    return res.status(200).json({ success: users });
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};


/* ------------------------------ Create ----------------------------- */
export const insertUser = async (req: Request, res: Response) => {
  try {
    let {
      fullName,
      username,
      phone,
      email,
      password,
      roles,
      doctor,
      active,
    } = req.body as {
      fullName: string;
      username: string;
      phone?: string;
      email?: string;
      password: string;
      roles?: mongoose.Types.ObjectId[] | string[];
      doctor?: any;
      active?: boolean;
    };

    const formErrors: string[] = [];

    if (!fullName?.trim()) formErrors.push("Le nom est obligatoire");
    if (!username?.trim()) formErrors.push("Le nom d'utilisateur est obligatoire");
    if (!password?.trim()) password = "1212"
    if ((!roles || (Array.isArray(roles) && roles.length === 0)) && !doctor?.isDoctor)
      formErrors.push("Choisir au moins un groupe");

    if (formErrors.length) return res.status(300).json({ formErrors });

    // unicité username (sur username_lc)
    const username_lc = String(username).toLowerCase();
    const exists = await UserModel.findOne({ username_lc });
    if (exists) return res.status(409).json({ formErrors: ["Le nom d'utilisateur existe déjà"] });

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
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
    return await getUsers(req, res);
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

/* ------------------------------ Update ----------------------------- */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ formErrors: ["Identifiant invalide"] });

    const current = await UserModel.findById(id);
    if (!current) return res.status(404).json({ formErrors: ["Utilisateur introuvable"] });
    let {
      fullName,
      username,
      phone,
      email,
      password,
      roles,
      doctor,
      active,
    } = req.body as Partial<{
      fullName: string;
      username: string;
      phone: string;
      email: string;
      password: string;
      roles: mongoose.Types.ObjectId[] | string[];
      doctor: any;
      active: boolean;
    }>;

    const formErrors: string[] = [];

    // si username changé → vérifier unicité
    if (typeof username === "string" && username.trim() !== current.username) {
      const username_lc = username.toLowerCase();
      const clash = await UserModel.findOne({ _id: { $ne: id }, username_lc });
      if (clash) formErrors.push("Le nom d'utilisateur existe déjà");
    }

    if (formErrors.length) return res.status(400).json({ formErrors });

    const update: any = {};

    if (typeof fullName === "string") update.fullName = fullName.trim();
    if (typeof username === "string") {
      update.username = username.trim();
      update.username_lc = username.trim().toLowerCase();
    }
    if (typeof phone === "string") update.phone = phone.trim();
    if (typeof email === "string") update.email = email.trim();
    if (Array.isArray(roles)) update.roles = roles;
    if (typeof active === "boolean") update.active = active;
    if (doctor !== undefined) update.doctor = doctor;

    if (typeof password === "string" && password.trim().length > 0) {
      update.passwordHash = await bcrypt.hash(password, 10);
    }

    await UserModel.updateOne({ _id: id }, { $set: update });

    // على منوالك: أعد القائمة بعد التحديث
    return await getUsers(req, res);
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

/* ------------------------------ Delete ----------------------------- */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!mongoose.isValidObjectId(id))
      return res.status(300).json({ formErrors: ["Identifiant invalide"] });

    // TODO: تحقق من علاقات المستخدم في وثائق أخرى إن كانت لازمة
    await UserModel.deleteOne({ _id: id });

    // أعد القائمة كما في منطقك السابق
    return await getUsers(req, res);
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};


export const listDoctors = async (req: Request, res: Response) => {
  try {
    const { q, page: pageRaw, limit: limitRaw } = req.query as {
      q?: string; page?: string; limit?: string;
    };

    const page = toPosInt(pageRaw, 1);
    const limit = toPosInt(limitRaw, 20, 100);
    const skip = (page - 1) * limit;

    const and: any[] = [{ "doctor.isDoctor": true }];
    if (q?.trim()) {
      const rx = new RegExp(escapeRegex(q.trim()), "i");
      and.push({ $or: [{ fullName: rx }, { username: rx }] });
    }
    const filter = { $and: and };

    const [total, items] = await Promise.all([
      UserModel.countDocuments(filter),
      UserModel.find(filter).select("_id fullName username").sort({ fullName: 1 }).skip(skip).limit(limit).lean()
    ]);
    const pages = Math.max(1, Math.ceil(total / limit));
    return res.status(200).json({ success: { items, total, page, limit, pages, hasNext: page < pages, hasPrev: page > 1 } });
  } catch (e: any) {
    return res.status(500).json({ err: e.message });
  }
};
