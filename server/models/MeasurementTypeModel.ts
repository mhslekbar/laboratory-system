import mongoose, { Schema, Document, Types } from "mongoose";

/* ================== Interfaces ================== */
export interface StageTemplate {
  _id: Types.ObjectId;
  name: string;
  order: number;
  color?: string;
  allowedRoles: Types.ObjectId[];
}

export interface MeasurementType extends Document {
  key: string;
  name: string;
  stages: StageTemplate[];
  createdAt?: Date;
  updatedAt?: Date;
}

/* ================== Schemas ================== */
const StageTemplateSchema = new Schema<StageTemplate>(
  {
    name:  { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 0 },
    color: { type: String, default: "#2563eb" },
    allowedRoles: [
      { type: Schema.Types.ObjectId, ref: "role", required: true },
    ],
  },
  { _id: true, timestamps: false }
);

const MeasurementTypeSchema = new Schema<MeasurementType>(
  {
    key:    { type: String, required: true, unique: true, index: true, trim: true },
    name:   { type: String, required: true, trim: true },
    stages: { type: [StageTemplateSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<MeasurementType>("measurementtype", MeasurementTypeSchema);
