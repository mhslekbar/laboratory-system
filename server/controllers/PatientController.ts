import { Request, Response } from "express";
import mongoose from "mongoose";
import PatientModel from "../models/PatientModel";
import UserModel from "../models/UserModel";

/* ===== Helpers ===== */

const toPosInt = (raw: any, def = 1, max = 1_000_000) => {
  const n = parseInt(String(raw ?? ""), 10);
  if (Number.isNaN(n) || n < 1) return def;
  return Math.min(n, max);
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isDoctorUser = (req: any) => !!req?.user?.doctor?.isDoctor;
const asObjectId = (id?: string) =>
  id && mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;

/* =========================================================
   GET /api/patients
   - Admin/Gérant : tous les patients (+ filtre q, doctorId, pagination)
   - Médecin     : uniquement ses patients (doctor = req.user._id)
   Query: q, page, limit, doctorId (optionnel pour admin/gerant)
   Retour: { items, total, page, limit, pages, hasNext, hasPrev }
   ========================================================= */
export const listPatients = async (req: any, res: Response) => {
  try {
    const { q, doctorId, page: pageRaw, limit: limitRaw } = req.query as {
      q?: string; doctorId?: string; page?: string; limit?: string;
    };

    const and: any[] = [];

    // Recherche texte
    if (q?.trim()) {
      const rx = new RegExp(escapeRegex(q.trim()), "i");
      and.push({ $or: [{ name: rx }, { phone: rx }, { notes: rx }] });
    }

    // Scope par rôle
    if (isDoctorUser(req)) {
      // médecin : uniquement ses patients
      and.push({ doctor: req.user._id });
    } else {
      // admin/gerant : peuvent filtrer par un médecin donné
      if (doctorId) {
        const oid = asObjectId(doctorId);
        if (!oid) return res.status(300).json({ formErrors: ["doctorId invalide"] });
        and.push({ doctor: oid });
      }
    }

    const filter = and.length ? { $and: and } : {};

    // Pagination
    const page = toPosInt(pageRaw, 1);
    const limit = toPosInt(limitRaw, 10, 100);
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      PatientModel.countDocuments(filter),
      PatientModel.find(filter)
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
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

/* =========================================================
   GET /api/patients/:id
   - Admin/Gérant : accès à tous
   - Médecin     : accès seulement si patient.doctor === moi
   ========================================================= */
export const getPatient = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(300).json({ formErrors: ["ID invalide"] });

    const patient: any = await PatientModel.findById(id)
      .populate({ path: "doctor", select: "fullName username doctor" })
      .lean();

    if (!patient) return res.status(300).json({ formErrors: ["Patient introuvable"] });

    if (isDoctorUser(req)) {
      if (!patient.doctor || String(patient.doctor?._id ?? patient.doctor) !== String(req.user._id)) {
        return res.status(403).json({ formErrors: ["Accès refusé"] });
      }
    }

    return res.status(200).json({ success: patient });
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

/* =========================================================
   POST /api/patients
   - Uniquement Admin/Gérant
   - Doit être assigné à un médecin (doctorId requis et valide)
   Body: { name, phone?, dob?, notes?, doctorId }
   ========================================================= */
export const createPatient = async (req: any, res: Response) => {
  try {
    if (isDoctorUser(req)) {
      return res.status(403).json({ formErrors: ["Création réservée à l'administration"] });
    }

    const { name, phone, dob, notes, doctorId } = req.body as {
      name: string; phone?: string; dob?: string | Date; notes?: string; doctorId?: string;
    };

    const formErrors: string[] = [];
    if (!name?.trim()) formErrors.push("Le nom est obligatoire");
    if (!doctorId) formErrors.push("Le médecin (doctorId) est obligatoire");

    const doctorOid = asObjectId(doctorId);
    if (!doctorOid) formErrors.push("doctorId invalide");

    if (formErrors.length) return res.status(300).json({ formErrors });

    // Vérifier que doctorId correspond à un utilisateur médecin
    const docUser = await UserModel.findById(doctorOid).lean();
    if (!docUser || !docUser.doctor?.isDoctor) {
      return res.status(300).json({ formErrors: ["Le docteur fourni est invalide"] });
    }

    const patient = await PatientModel.create({
      name: name.trim(),
      phone: phone?.trim() || undefined,
      dob: dob ? new Date(dob) : undefined,
      notes: notes?.trim() || undefined,
      doctor: doctorOid,
    });

    // return res.status(201).json({ success: patient });
    return await listPatients(req, res)
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

/* =========================================================
   PUT /api/patients/:id
   - Uniquement Admin/Gérant (médecin interdit)
   - Peut réassigner le patient à un autre médecin (doctorId)
   ========================================================= */
export const updatePatient = async (req: any, res: Response) => {
  try {
    if (isDoctorUser(req)) {
      return res.status(403).json({ formErrors: ["Modification réservée à l'administration"] });
    }

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(300).json({ formErrors: ["ID invalide"] });

    const { name, phone, dob, notes, doctorId } = req.body as {
      name?: string; phone?: string; dob?: string | Date; notes?: string; doctorId?: string | null;
    };

    const patch: any = {};
    if (name !== undefined)  patch.name  = String(name).trim();
    if (phone !== undefined) patch.phone = String(phone).trim() || undefined;
    if (dob !== undefined)   patch.dob   = dob ? new Date(dob) : undefined;
    if (notes !== undefined) patch.notes = String(notes).trim() || undefined;

    if (doctorId !== undefined) {
      if (doctorId === null || doctorId === "") {
        patch.doctor = null;
      } else {
        const oid = asObjectId(doctorId);
        if (!oid) return res.status(300).json({ formErrors: ["doctorId invalide"] });
        const docUser = await UserModel.findById(oid).lean();
        if (!docUser || !docUser.doctor?.isDoctor) {
          return res.status(300).json({ formErrors: ["Le docteur fourni est invalide"] });
        }
        patch.doctor = oid;
      }
    }

    const updated = await PatientModel.findByIdAndUpdate(id, { $set: patch }, { new: true })
      .populate({ path: "doctor", select: "fullName username doctor" })
      .lean();

    if (!updated) return res.status(300).json({ formErrors: ["Patient introuvable"] });
    // return res.status(200).json({ success: updated });
    return await listPatients(req, res)

  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

/* =========================================================
   DELETE /api/patients/:id
   - Uniquement Admin/Gérant
   ========================================================= */
export const deletePatient = async (req: any, res: Response) => {
  try {
    if (isDoctorUser(req)) {
      return res.status(403).json({ formErrors: ["Suppression réservée à l'administration"] });
    }

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(300).json({ formErrors: ["ID invalide"] });

    const deleted = await PatientModel.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(300).json({ formErrors: ["Patient introuvable"] });

    // return res.status(200).json({ success: true });
    return await listPatients(req, res)

  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

