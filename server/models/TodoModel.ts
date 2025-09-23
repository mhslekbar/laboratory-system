// server/models/Todo.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface TodoDoc extends Document {
  title: string;
  notes?: string;
  done: boolean;
  dueAt?: Date | null;
  priority: "low" | "medium" | "high";
  createdBy: Types.ObjectId;  // l'utilisateur qui a créé la tâche
  assignedTo?: Types.ObjectId | null; // optionnel: assignée à un user
}

const TodoSchema = new Schema<TodoDoc>(
  {
    title:    { type: String, required: true, trim: true, index: true },
    notes:    { type: String, trim: true },
    done:     { type: Boolean, default: false, index: true },
    dueAt:    { type: Date, default: null, index: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium", index: true },
    createdBy:{ type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
    assignedTo:{ type: Schema.Types.ObjectId, ref: "user", default: null, index: true },
  },
  { timestamps: true }
);

TodoSchema.index({ title: "text", notes: "text" });
TodoSchema.index({ createdBy: 1, done: 1, dueAt: 1 });

export default mongoose.model<TodoDoc>("todo", TodoSchema);
