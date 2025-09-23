"use strict";
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
// models/CaseModel.ts
const mongoose_1 = __importStar(require("mongoose"));
const CaseStageSchema = new mongoose_1.Schema({
    stage: { type: mongoose_1.Schema.Types.ObjectId, required: true }, // ref إلى subdoc — ستُحلّ عبر $lookup
    status: { type: String, enum: ["pending", "in_progress", "done"], default: "pending", required: true },
    startedAt: Date,
    completedAt: Date,
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: "user" },
}, { _id: false, timestamps: false });
const CaseSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true, index: true, trim: true },
    doctor: { type: mongoose_1.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    patient: { type: mongoose_1.Schema.Types.ObjectId, ref: "patient", required: true, index: true },
    type: { type: mongoose_1.Schema.Types.ObjectId, ref: "measurementtype", required: true, index: true },
    note: { type: String, trim: true },
    currentStageOrder: { type: Number, default: 0 },
    stages: { type: [CaseStageSchema], default: [] },
    attachments: {
        type: [
            {
                url: { type: String, required: true },
                name: { type: String, trim: true },
                mime: { type: String, trim: true },
                size: { type: Number },
                uploadedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "user" },
                at: { type: Date, default: Date.now },
            },
        ],
        default: [],
    },
    delivery: {
        status: { type: String, enum: ["pending", "scheduled", "delivered", "returned"], default: "pending" },
        date: { type: Date },
        note: { type: String, trim: true },
    },
    caseApproval: {
        approved: { type: Boolean, default: false },
        by: { type: mongoose_1.Schema.Types.ObjectId, ref: "user" },
        at: { type: Date },
        note: { type: String, trim: true },
    },
    auditTrail: {
        type: [
            {
                actorRole: { type: String, enum: ["LAB", "DOCTOR", "SYSTEM"], required: true },
                action: { type: String, required: true, trim: true },
                meta: { type: mongoose_1.Schema.Types.Mixed },
                at: { type: Date, default: Date.now },
            },
        ],
        default: [],
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("case", CaseSchema);
