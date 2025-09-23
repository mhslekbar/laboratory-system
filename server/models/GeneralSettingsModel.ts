import mongoose, { Schema, Document } from "mongoose";

export interface IGeneralSettings extends Document {
  company: {
    name: string;
    legalName: string;
    taxId: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logoUrl: string;
    faviconUrl: string;
  };
  localization: {
    defaultLanguage: string;
    timezone: string;
    defaultCurrency: string;
    dateFormat: string;
    numberFormat: string;
  };
  branding: {
    theme: { primaryColor: string; mode: "system" | "light" | "dark" };
    printHeaderHTML: string;
    printFooterHTML: string;
  };
  updatedAt?: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const CompanySchema = new Schema(
  {
    name: { type: String, default: "" },
    legalName: { type: String, default: "" },
    taxId: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
  },
  { _id: false }
);

const LocalizationSchema = new Schema(
  {
    defaultLanguage: { type: String, default: "fr" },
    timezone: { type: String, default: "Africa/Nouakchott" },
    defaultCurrency: { type: String, default: "MRU" },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    numberFormat: { type: String, default: "1 234,56" },
  },
  { _id: false }
);

const BrandingSchema = new Schema(
  {
    theme: {
      primaryColor: { type: String, default: "#4f46e5" },
      mode: { type: String, enum: ["system", "light", "dark"], default: "system" },
    },
    printHeaderHTML: { type: String, default: "" },
    printFooterHTML: { type: String, default: "" },
  },
  { _id: false }
);

const GeneralSettingsSchema = new Schema<IGeneralSettings>(
  {
    company: { type: CompanySchema, default: {} },
    localization: { type: LocalizationSchema, default: {} },
    branding: { type: BrandingSchema, default: {} },
    updatedAt: { type: Date },
    updatedBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  { versionKey: false }
);

// Un seul doc (singleton). On peut aussi imposer une contrainte si besoin.
export const GeneralSettingsModel =
  mongoose.models.general_settings ||
  mongoose.model<IGeneralSettings>("general_settings", GeneralSettingsSchema);
