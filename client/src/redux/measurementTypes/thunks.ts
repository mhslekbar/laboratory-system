// src/redux/measurementTypes/thunks.ts
import { Dispatch } from "react";
import {
  listMeasurementTypesApi,
  createMeasurementTypeApi,
  updateMeasurementTypeApi,
  deleteMeasurementTypeApi,
  addStageApi,
  updateStageApi,
  removeStageApi,
  StageTemplate,
} from "./api";
import { mtStart, mtSuccess, mtFailure } from "./slice";

// LIST
export const fetchMeasurementTypes =
  (params?: { q?: string; page?: number; limit?: number }) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(mtStart());
      const res = await listMeasurementTypesApi(params);
      const { items, ...meta } = res || { items: [] };
      dispatch(mtSuccess({ items, meta }));
      return true;
    } catch (e: any) {
      dispatch(mtFailure([e?.response?.data || e?.message]));
      return false;
    }
  };

// CREATE
export const createMeasurementType =
  (data: { key: string; name: string; stages?: Omit<StageTemplate, "_id">[] }) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(mtStart());
      await createMeasurementTypeApi(data);
      return dispatch(fetchMeasurementTypes());
    } catch (e: any) {
      dispatch(mtFailure([e?.response?.data || e?.message]));
      return false;
    }
  };

// UPDATE
export const updateMeasurementType =
  (id: string, data: Partial<{ name: string; stages: StageTemplate[] }>) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(mtStart());
      await updateMeasurementTypeApi(id, data);
      return dispatch(fetchMeasurementTypes());
    } catch (e: any) {
      dispatch(mtFailure([e?.response?.data || e?.message]));
      return false;
    }
  };

// DELETE
export const deleteMeasurementType =
  (id: string) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(mtStart());
      await deleteMeasurementTypeApi(id);
      return dispatch(fetchMeasurementTypes());
    } catch (e: any) {
      dispatch(mtFailure([e?.response?.data || e?.message]));
      return false;
    }
  };

// STAGES
export const addStage =
  (
    id: string,
    stage: Omit<StageTemplate, "_id"> // name, color?, order?, allowedRoles?
  ) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(mtStart());
      await addStageApi(id, stage);
      return dispatch(fetchMeasurementTypes());
    } catch (e: any) {
      dispatch(mtFailure([e?.response?.data || e?.message]));
      return false;
    }
  };

export const updateStage =
  (
    id: string,
    stageId: string, // <- stageId au lieu de stageKey
    data: Partial<Omit<StageTemplate, "_id">>
  ) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(mtStart());
      await updateStageApi(id, stageId, data);
      return dispatch(fetchMeasurementTypes());
    } catch (e: any) {
      dispatch(mtFailure([e?.response?.data || e?.message]));
      return false;
    }
  };

export const removeStage =
  (id: string, stageId: string, force = false) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(mtStart());
      await removeStageApi(id, stageId, force);
      return dispatch(fetchMeasurementTypes());
    } catch (e: any) {
      dispatch(mtFailure([e?.response?.data || e?.message]));
      return false;
    }
  };
