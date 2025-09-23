"use strict";
// server/models/UserModel.ts
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
const mongoose_1 = __importStar(require("mongoose"));
const DoctorProfileSchema = new mongoose_1.Schema({
    isDoctor: { type: Boolean, default: false },
    clinicName: { type: String, trim: true },
    phone: { type: String, trim: true },
}, { _id: false });
const UserSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true, trim: true },
    // username + version lowercase indexée
    username: { type: String, required: true, unique: true, trim: true, index: true },
    username_lc: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    active: { type: Boolean, default: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    doctor: { type: DoctorProfileSchema, required: false, default: undefined },
    roles: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "role", index: true, default: [] }],
}, { timestamps: true });
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
exports.default = mongoose_1.default.model("user", UserSchema);
