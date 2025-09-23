"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralSettingsModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CompanySchema = new mongoose_1.Schema({
    name: { type: String, default: "" },
    legalName: { type: String, default: "" },
    taxId: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
}, { _id: false });
const LocalizationSchema = new mongoose_1.Schema({
    defaultLanguage: { type: String, default: "fr" },
    timezone: { type: String, default: "Africa/Nouakchott" },
    defaultCurrency: { type: String, default: "MRU" },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    numberFormat: { type: String, default: "1 234,56" },
}, { _id: false });
const BrandingSchema = new mongoose_1.Schema({
    theme: {
        primaryColor: { type: String, default: "#4f46e5" },
        mode: { type: String, enum: ["system", "light", "dark"], default: "system" },
    },
    printHeaderHTML: { type: String, default: "" },
    printFooterHTML: { type: String, default: "" },
}, { _id: false });
const GeneralSettingsSchema = new mongoose_1.Schema({
    company: { type: CompanySchema, default: {} },
    localization: { type: LocalizationSchema, default: {} },
    branding: { type: BrandingSchema, default: {} },
    updatedAt: { type: Date },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "user" },
}, { versionKey: false });
// Un seul doc (singleton). On peut aussi imposer une contrainte si besoin.
exports.GeneralSettingsModel = mongoose_1.default.models.general_settings ||
    mongoose_1.default.model("general_settings", GeneralSettingsSchema);
