"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putGeneralSettings = exports.getGeneralSettings = void 0;
const GeneralSettingsModel_1 = require("../models/GeneralSettingsModel");
// crée (si absent) + renvoie
const getGeneralSettings = async (_req, res) => {
    try {
        let doc = await GeneralSettingsModel_1.GeneralSettingsModel.findOne();
        if (!doc) {
            doc = await GeneralSettingsModel_1.GeneralSettingsModel.create({});
        }
        return res.status(200).json({ success: doc });
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.getGeneralSettings = getGeneralSettings;
// met à jour partiellement (merge) et renvoie
const putGeneralSettings = async (req, res) => {
    try {
        const body = req.body || {};
        const patch = {
            ...(body.company ? { company: body.company } : {}),
            ...(body.localization ? { localization: body.localization } : {}),
            ...(body.branding ? { branding: body.branding } : {}),
            updatedAt: new Date(),
            updatedBy: req.user?._id, // optionnel si auth
        };
        const doc = await GeneralSettingsModel_1.GeneralSettingsModel.findOneAndUpdate({}, { $set: patch }, { new: true, upsert: true });
        return res.json({ success: doc });
    }
    catch (err) {
        return res.status(500).json({ err: err.message });
    }
};
exports.putGeneralSettings = putGeneralSettings;
//# sourceMappingURL=GeneralSettingsController.js.map