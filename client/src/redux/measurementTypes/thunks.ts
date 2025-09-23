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
  (data: { key: string; name: string; stages?: any[] }) =>
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
  (id: string, data: any) =>
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
  (id: string, stage: any) =>
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
  (id: string, stageKey: string, data: any) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(mtStart());
      await updateStageApi(id, stageKey, data);
      return dispatch(fetchMeasurementTypes());
    } catch (e: any) {
      dispatch(mtFailure([e?.response?.data || e?.message]));
      return false;
    }
  };

export const removeStage =
  (id: string, stageKey: string) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(mtStart());
      await removeStageApi(id, stageKey);
      return dispatch(fetchMeasurementTypes());
    } catch (e: any) {
      dispatch(mtFailure([e?.response?.data || e?.message]));
      return false;
    }
  };
