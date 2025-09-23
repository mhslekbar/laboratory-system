// src/redux/cases/thunks.ts
import { Dispatch } from "react";
import {
  listCasesApi,
  createCaseApi,
  updateCaseApi,
  deleteCaseApi,
  advanceStageApi,
  setStageStatusApi,
  setDeliveryStatusApi,
  updateCaseDeliveryApi,
  updateCaseApprovalApi,
  StageStatus,
  DeliveryStatus,
} from "./api";
import { casesStart, casesSuccess, casesFailure } from "./slice";

/* ===================== LIST ===================== */
export const fetchCases = (params?: {
  q?: string;
  patientId?: string;
  doctorId?: string;
  typeId?: string;
  page?: number;
  limit?: number;
  delivery?: "all" | DeliveryStatus;
}) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(casesStart());
    const res = await listCasesApi(params);
    const { items = [], ...meta } = res || { items: [] };
    dispatch(casesSuccess({ items, meta }));
    return true;
  } catch (e: any) {
    dispatch(casesFailure([e?.response?.data || e?.message]));
    return false;
  }
};

/* ===================== CREATE ===================== */
export const createCase = (data: {
  doctor: string;
  patient: string;
  type: string;
  note?: string;
}) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(casesStart());
    await createCaseApi(data);
    return dispatch(fetchCases());
  } catch (e: any) {
    dispatch(casesFailure([e?.response?.data || e?.message]));
    return false;
  }
};

/* ===================== UPDATE ===================== */
export const updateCase = (id: string, data: any) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(casesStart());
    await updateCaseApi(id, data);
    return dispatch(fetchCases());
  } catch (e: any) {
    dispatch(casesFailure([e?.response?.data || e?.message]));
    return false;
  }
};

/* ===================== DELETE ===================== */
export const deleteCase = (id: string) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(casesStart());
    await deleteCaseApi(id);
    return dispatch(fetchCases());
  } catch (e: any) {
    dispatch(casesFailure([e?.response?.data || e?.message]));
    return false;
  }
};

/* ===================== STAGES ===================== */

type AdvancePayload = { toOrder?: number; toStageId?: string; toKey?: string; status?: StageStatus };

export const updateCaseStage = (id: string, payload: AdvancePayload) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(casesStart());
      await advanceStageApi(id, payload);
      return dispatch(fetchCases());
    } catch (e: any) {
      dispatch(casesFailure([e?.response?.data || e?.message]));
      return false;
    }
  };

/** ملاحظة: ما زلنا نسمّي الوسيطة stageKey لأجل التوافق مع الاستدعاءات الحالية،
 *  لكن يمكن تمرير stageId أيضًا (لأن الـ API يقبل id أو key) */
export const setStageStatus = (
  id: string,
  stageKeyOrId: string,
  status: StageStatus
) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(casesStart());
    await setStageStatusApi(id, stageKeyOrId, status);
    return dispatch(fetchCases());
  } catch (e: any) {
    dispatch(casesFailure([e?.response?.data || e?.message]));
    return false;
  }
};

/* ===================== DELIVERY ===================== */

export const setDeliveryStatus = (id: string, status: DeliveryStatus) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(casesStart());
      await setDeliveryStatusApi(id, status);
      return dispatch(fetchCases());
    } catch (e: any) {
      dispatch(casesFailure([e?.response?.data || e?.message]));
      return false;
    }
  };

/** يتوافق مع { status, date? } */
export const updateCaseDelivery = (
  id: string,
  payload: {
    status: DeliveryStatus;
    date?: string | null;
  }
) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(casesStart());
    await updateCaseDeliveryApi(id, payload);
    return dispatch(fetchCases());
  } catch (e: any) {
    dispatch(casesFailure([e?.response?.data || e?.message]));
    return false;
  }
};

/* ===================== APPROVAL ===================== */

export const updateCaseApproval = (
  id: string,
  payload: { approved: boolean; by?: string; note?: string }
) => async (dispatch: any) => {
  try {
    dispatch(casesStart());
    await updateCaseApprovalApi(id, payload);
    return dispatch(fetchCases());
  } catch (e: any) {
    dispatch(casesFailure([e?.response?.data || e?.message]));
    return false;
  }
};
