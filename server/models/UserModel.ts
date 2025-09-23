// server/models/UserModel.ts

import mongoose, { Schema, Document, Model, Types } from "mongoose";

// --- Subdocument du profil docteur (optionnel) ---
export interface DoctorProfile {
  isDoctor: boolean;
  clinicName?: string;
  phone?: string;
}

const DoctorProfileSchema = new Schema<DoctorProfile>(
  {
    isDoctor: { type: Boolean, default: false },
    clinicName: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
);

// --- Référence de rôle (RBAC) : ObjectId vers 'role' ---
export type RoleRef = Types.ObjectId;

// --- Types (Attrs pour création, Doc pour Mongo) ---
export interface UserAttrs {
  name: string;
  username: string;
  passwordHash: string;   // stocke le hash (bcrypt)
  active?: boolean;
  email?: string;
  phone?: string;
  doctor?: DoctorProfile;
  roles?: RoleRef[];
  dev: boolean;
}

export interface UserInterface extends Document {
  _id: string,
  fullName: string;
  username: string;
  username_lc: string;     // pour recherche case-insensitive
  passwordHash: string;
  active: boolean;
  email?: string;
  phone?: string;
  doctor?: DoctorProfile;
  roles: RoleRef[];
  createdAt: Date;
  updatedAt: Date;
  dev: false;

}

export interface UserModel extends Model<UserInterface> {
  build(attrs: UserAttrs): UserInterface;
}

const UserSchema = new Schema<UserInterface, UserModel>(
  {
    fullName: { type: String, required: true, trim: true },

    // username + version lowercase indexée
    username:   { type: String, required: true, unique: true, trim: true, index: true },
    username_lc:{ type: String, required: true, unique: true, index: true },

    passwordHash: { type: String, required: true },
    active: { type: Boolean, default: true, index: true },

    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    doctor: { type: DoctorProfileSchema, required: false, default: undefined },

    roles: [{ type: Schema.Types.ObjectId, ref: "role", index: true, default: [] }],
    
  },
  { timestamps: true }
);

// Normaliser username_lc automatiquement
UserSchema.pre("save", function (next) {
  if (this.isModified("username")) {
    // @ts-ignore
    this.username_lc = this.username.toLowerCase();
  }
  next();
});

// Factory pour créer documents typés
// UserSchema.statics.build = function (attrs: UserAttrs) {
  // return new User(attrs);
// };

// const User = mongoose.model<UserInterface, UserModel>("user", UserSchema);
export default mongoose.model<UserInterface, UserModel>("user", UserSchema);
