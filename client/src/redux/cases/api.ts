// src/redux/cases/api.ts
import { get, privateRequest, TypeMethod } from "../../requestMethods";

/* ===================== Types ===================== */
export type StageStatus = "pending" | "in_progress" | "done";

/** مطابق للـ backend الجديد */
export type DeliveryStatus = "pending" | "scheduled" | "delivered" | "returned";

export type CaseStageDto = {
  /** مرجع مرحلة القالب داخل الـ MeasurementType */
  stage: string;

  /** يُعاد من الـ API للعرض (ديناميكيًا) — لا ترسلها عند الحفظ */
  key?: string;
  name?: string;
  order?: number;
  color?: string;

  status: StageStatus;
  startedAt?: string | null;
  completedAt?: string | null;

  /** اختياري: إن كنت تستعمله في الواجهة */
  assignedTo?: string | null;
  note?: string; // فقط لو أضفته في الموديل؛ وإلا احذفه من النوع
};

export type CaseDto = {
  _id?: string;
  code?: string;
  doctor: string | { _id: string; fullName?: string; username?: string };
  patient: string | { _id: string; name?: string };
  type: string | { _id: string; key?: string; name?: string };

  stages?: CaseStageDto[];
  currentStageOrder?: number;

  /** مطابق للموديل الجديد: تاريخ واحد اختياري */
  delivery?: {
    status: DeliveryStatus;
    date?: string | null;
  };

  caseApproval?: { approved: boolean; at?: string; by?: string; note?: string };
  attachments?: { url: string; name?: string; mime?: string; size?: number; uploadedAt?: string; uploadedBy?: string }[];

  createdAt?: string;
  updatedAt?: string;
};

/* ===================== APIs ===================== */

// Liste paginée (q, doctorId, patientId, typeId, status)
export const listCasesApi = async (p?: {
  q?: string;
  page?: number;
  limit?: number;
  delivery?: DeliveryStatus | "all";
  doctorId?: string;
  patientId?: string;
  typeId?: string;
}) => {
  const qs = new URLSearchParams();
  if (p?.q) qs.set("q", p.q);
  if (p?.page) qs.set("page", String(p.page));
  if (p?.limit) qs.set("limit", String(p.limit));
  if (p?.doctorId) qs.set("doctorId", p.doctorId);
  if (p?.patientId) qs.set("patientId", p.patientId);
  if (p?.typeId) qs.set("typeId", p.typeId);
  // backend ينتظر ?status= (حالة التسليم)
  if (p?.delivery && p.delivery !== "all") qs.set("status", p.delivery);
  const res = await get(`cases${qs.toString() ? `?${qs}` : ""}`);
  return res?.data?.success as {
    items: CaseDto[];
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// Création
export const createCaseApi = async (data: {
  doctor: string;
  patient: string;
  type: string;
  note?: string;
}) => privateRequest(TypeMethod.POST, "cases", data);

// Mise à jour (données générales)
export const updateCaseApi = async (id: string, data: Partial<CaseDto>) =>
  privateRequest(TypeMethod.PUT, `cases/${id}`, data);

// Suppression
export const deleteCaseApi = async (id: string) =>
  privateRequest(TypeMethod.DELETE, `cases/${id}`);

// Avancer/revenir d’étape
export const advanceStageApi = async (
  id: string,
  payload: { toOrder?: number; toStageId?: string; toKey?: string; status?: StageStatus }
) => privateRequest(TypeMethod.POST, `cases/${id}/advance`, payload);

// Changer le statut d’une étape précise (id أو key كلاهما مقبولان)
export const setStageStatusApi = async (
  id: string,
  stageIdOrKey: string,
  status: StageStatus
) =>
  privateRequest(
    TypeMethod.POST,
    `cases/${id}/stages/${stageIdOrKey}/status`,
    { status }
  );

// Changer uniquement statut livraison (بسيط)
export const setDeliveryStatusApi = async (id: string, status: DeliveryStatus) =>
  privateRequest(TypeMethod.POST, `cases/${id}/delivery`, { status });

// Mettre à jour livraison مع التاريخ (يتوافق مع الموديل الجديد)
export const updateCaseDeliveryApi = async (
  id: string,
  payload: {
    status: DeliveryStatus;
    date?: string | null;
  }
) => privateRequest(TypeMethod.POST, `cases/${id}/delivery`, payload);

// Approbation
export const updateCaseApprovalApi = async (
  id: string,
  payload: { approved: boolean; by?: string; note?: string }
) => privateRequest(TypeMethod.POST, `cases/${id}/approve`, payload);
