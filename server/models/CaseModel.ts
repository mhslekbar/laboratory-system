// models/CaseModel.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export type CaseStageStatus = "pending" | "in_progress" | "done";

export interface CaseStage {
  stage: Types.ObjectId;                  // مرجع لِـ MeasurementType.stages[*]._id
  status: CaseStageStatus;                // حالة التنفيذ الفعلية
  startedAt?: Date;
  completedAt?: Date;
  assignedTo?: Types.ObjectId | null;     // user
}

export interface DeliveryInfo {
  status: "pending" | "scheduled" | "delivered" | "returned";
  date?: Date | null;
  note?: string;
}

export interface CaseApproval {
  approved: boolean;
  by?: Types.ObjectId | null;             // user
  at?: Date | null;
  note?: string;
}

export interface CaseAudit {
  actorRole: "LAB" | "DOCTOR" | "SYSTEM";
  action: string;                         // ex: create, update_stage, approve, deliver...
  meta?: Record<string, any>;
  at: Date;
}

export interface CaseDoc extends Document {
  code: string;
  doctor: Types.ObjectId;
  patient: Types.ObjectId;
  type: Types.ObjectId;                   // measurementtype._id
  note?: string;
  currentStageOrder?: number;             // اختياري: فهرس/Order الحالي
  stages: CaseStage[];
  attachments: Array<{
    url: string;
    name?: string;
    mime?: string;
    size?: number;
    uploadedBy?: Types.ObjectId | null;
    at?: Date;
  }>;
  delivery: DeliveryInfo;
  caseApproval: CaseApproval;
  auditTrail: CaseAudit[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CaseStageSchema = new Schema<CaseStage>(
  {
    stage:      { type: Schema.Types.ObjectId, required: true }, // ref إلى subdoc — ستُحلّ عبر $lookup
    status:     { type: String, default: "pending", required: true },
    startedAt:  Date,
    completedAt:Date,
    assignedTo: { type: Schema.Types.ObjectId, ref: "user" },
  },
  { _id: false, timestamps: false }
);

const CaseSchema = new Schema<CaseDoc>(
  {
    code:   { type: String, required: true, unique: true, index: true, trim: true },
    doctor: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
    patient:{ type: Schema.Types.ObjectId, ref: "patient", required: true, index: true },
    type:   { type: Schema.Types.ObjectId, ref: "measurementtype", required: true, index: true },
    note:   { type: String, trim: true },

    currentStageOrder: { type: Number, default: 0 },

    stages: { type: [CaseStageSchema], default: [] },

    attachments: {
      type: [
        {
          url:        { type: String, required: true },
          name:       { type: String, trim: true },
          mime:       { type: String, trim: true },
          size:       { type: Number },
          uploadedBy: { type: Schema.Types.ObjectId, ref: "user" },
          at:         { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    delivery: {
      status: { type: String, default: "pending" },
      date:   { type: Date },
      note:   { type: String, trim: true },
    },

    caseApproval: {
      approved: { type: Boolean, default: false },
      by:       { type: Schema.Types.ObjectId, ref: "user" },
      at:       { type: Date },
      note:     { type: String, trim: true },
    },

    auditTrail: {
      type: [
        {
          actorRole: { type: String, required: true },
          action:    { type: String, required: true, trim: true },
          meta:      { type: Schema.Types.Mixed },
          at:        { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<CaseDoc>("case", CaseSchema);
