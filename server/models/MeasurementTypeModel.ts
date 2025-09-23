// models/MeasurementTypeModel.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface StageTemplate {
  _id: Types.ObjectId;
  key: string;
  name: string;
  order: number;
  color?: string;
}

export interface MeasurementType extends Document {
  key: string;
  name: string;
  stages: StageTemplate[];
  createdAt?: Date;
  updatedAt?: Date;
}

const StageTemplateSchema = new Schema<StageTemplate>(
  {
    key:   { type: String, required: true, trim: true },
    name:  { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 0 },
    color: { type: String, default: "#2563eb" },
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
