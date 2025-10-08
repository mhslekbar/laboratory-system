// src/redux/measurementTypes/api.ts
import { get, privateRequest, TypeMethod } from "../../requestMethods";

/* ============== Types ============== */
export type StageTemplate = {
  _id?: string;          // présent quand on lit depuis l’API
  name: string;
  order?: number;
  color?: string;
  allowedRoles?: string[]; // ObjectIds des rôles
};

export type MeasurementTypeDto = {
  _id?: string;
  key: string;
  name: string;
  stages: StageTemplate[];
  createdAt?: string;
  updatedAt?: string;
};

export type ListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

/* ============== APIs ============== */

// Liste paginée
export const listMeasurementTypesApi = async (p?: {
  q?: string;
  page?: number;
  limit?: number;
}) => {
  const qs = new URLSearchParams();
  if (p?.q) qs.set("q", p.q);
  if (p?.page) qs.set("page", String(p.page));
  if (p?.limit) qs.set("limit", String(p.limit));
  const res = await get(`measurementtype${qs.toString() ? `?${qs}` : ""}`);
  return res?.data?.success as ListResponse<MeasurementTypeDto>;
};

// Création
export const createMeasurementTypeApi = async (data: {
  key: string;
  name: string;
  stages?: Omit<StageTemplate, "_id">[]; // name, color?, order?, allowedRoles?
}) => privateRequest(TypeMethod.POST, "measurementtype", data);

// Mise à jour
export const updateMeasurementTypeApi = async (
  id: string,
  data: Partial<{ name: string; stages: StageTemplate[] }> // pour update on peut inclure _id par étape
) => privateRequest(TypeMethod.PUT, `measurementtype/${id}`, data);

// Suppression
export const deleteMeasurementTypeApi = async (id: string) =>
  privateRequest(TypeMethod.DELETE, `measurementtype/${id}`);

// Stages ciblés
export const addStageApi = async (
  id: string,
  stage: Omit<StageTemplate, "_id">
) =>
  privateRequest(TypeMethod.POST, `measurementtype/${id}/stages`, {
    stage, // { name, color?, order?, allowedRoles? }
  });

export const updateStageApi = async (
  id: string,
  stageId: string,
  data: Partial<Omit<StageTemplate, "_id">>
) =>
  privateRequest(
    TypeMethod.PUT,
    `measurementtype/${id}/stages/${stageId}`,
    data
  );

export const removeStageApi = async (id: string, stageId: string, force = false) =>
  privateRequest(
    TypeMethod.DELETE,
    `measurementtype/${id}/stages/${stageId}${force ? "?force=true" : ""}`
  );
