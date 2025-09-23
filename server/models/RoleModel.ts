// server/models/RoleModel.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface RoleAttrs {
  name: string;
  permissions?: Types.ObjectId[]; // refs -> permission._id
}

export interface RoleDoc extends Document {
  name: string;
  permissions: Types.ObjectId[];  // refs -> permission._id
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleModel extends Model<RoleDoc> {
  build(attrs: RoleAttrs): RoleDoc;
}

const RoleSchema = new Schema<RoleDoc, RoleModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,   // اسم الدور فريد
      index: true
    },
    permissions: [
      { type: Schema.Types.ObjectId, ref: "permission", index: true }
    ]
  },
  { timestamps: true }
);

// Factory method لسهولة الإنشاء مع أنواع صارمة
RoleSchema.statics.build = function (attrs: RoleAttrs) {
  return new Role(attrs);
};

const Role = mongoose.model<RoleDoc, RoleModel>("role", RoleSchema);
export default Role;
