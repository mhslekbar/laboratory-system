// server/models/PermissionModel.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface PermissionDoc extends Document {
  name: string;
  collectionName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionModel extends Model<PermissionDoc> {}

const PermissionSchema = new Schema<PermissionDoc>(
  {
    name: { type: String, required: true, trim: true },
    collectionName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// منع تكرار نفس الاسم في نفس المجموعة
PermissionSchema.index({ name: 1, collectionName: 1 }, { unique: true });

const Permission = mongoose.model<PermissionDoc, PermissionModel>(
  "permission",
  PermissionSchema
);
export default Permission;
