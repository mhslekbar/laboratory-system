// server/models/Patient.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface Patient extends Document {
  name: string;
  phone?: string;
  dob?: Date;
  notes?: string;
  /** Référence vers l'utilisateur médecin qui suit ce patient */
  doctor?: Types.ObjectId;
}

const PatientSchema = new Schema<Patient>(
  {
    name:  { type: String, required: true, trim: true, index: true },
    phone: { type: String, trim: true },
    dob:   Date,
    notes: { type: String, trim: true },
    // 👇 Nouveau champ : ref vers la collection "user"
    doctor: { type: Schema.Types.ObjectId, ref: "user", index: true, default: null },
  },
  { timestamps: true }
);

// Index utiles
PatientSchema.index({ name: "text" });
PatientSchema.index({ phone: 1 });
// Recherches rapides par docteur + nom
PatientSchema.index({ doctor: 1, name: 1 });

export default mongoose.model<Patient>("patient", PatientSchema);
