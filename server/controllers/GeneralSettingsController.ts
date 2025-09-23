import { Request, Response } from "express";
import { GeneralSettingsModel } from "../models/GeneralSettingsModel";

// crée (si absent) + renvoie
export const getGeneralSettings = async (_req: Request, res: Response) => {
  try {
    let doc = await GeneralSettingsModel.findOne();
    if (!doc) {
      doc = await GeneralSettingsModel.create({});
    }
    return res.status(200).json({ success: doc });
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};

// met à jour partiellement (merge) et renvoie
export const putGeneralSettings = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const patch: any = {
      ...(body.company ? { company: body.company } : {}),
      ...(body.localization ? { localization: body.localization } : {}),
      ...(body.branding ? { branding: body.branding } : {}),
      updatedAt: new Date(),
      updatedBy: (req as any).user?._id, // optionnel si auth
    };

    const doc = await GeneralSettingsModel.findOneAndUpdate(
      {},
      { $set: patch },
      { new: true, upsert: true }
    );

    return res.json({ success: doc });
  } catch (err: any) {
    return res.status(500).json({ err: err.message });
  }
};
