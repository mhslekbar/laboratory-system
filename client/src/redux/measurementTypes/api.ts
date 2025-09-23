// src/redux/measurementTypes/api.ts
import { get, privateRequest, TypeMethod } from "../../requestMethods";

/* ============== Types ============== */
export type StageTemplate = {
  key: string;
  name: string;
  order?: number;
  color?: string;
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
  stages?: StageTemplate[];
}) => privateRequest(TypeMethod.POST, "measurementtype", data);

// Mise à jour
export const updateMeasurementTypeApi = async (
  id: string,
  data: Partial<{ name: string; stages: StageTemplate[] }>
) => privateRequest(TypeMethod.PUT, `measurementtype/${id}`, data);

// Suppression
export const deleteMeasurementTypeApi = async (id: string) =>
  privateRequest(TypeMethod.DELETE, `measurementtype/${id}`);

// Stages ciblés
export const addStageApi = async (id: string, stage: StageTemplate) =>
  privateRequest(TypeMethod.POST, `measurementtype/${id}/stages`, { stage });

export const updateStageApi = async (
  id: string,
  stageKey: string,
  data: Partial<StageTemplate>
) => privateRequest(TypeMethod.PUT, `measurementtype/${id}/stages/${stageKey}`, data);

export const removeStageApi = async (id: string, stageKey: string) =>
  privateRequest(TypeMethod.DELETE, `measurementtype/${id}/stages/${stageKey}`);
