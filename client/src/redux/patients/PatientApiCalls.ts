// src/redux/patients/PatientApiCalls.ts

import { Dispatch } from "react";
import { statusPatientFailure, statusPatientStart, statusPatientSuccess } from "./patientSlice";
import { get, post, put, remove } from "../../requestMethods";

// export const ShowPatientApi = () => async (dispatch: Dispatch<any>) => {
export const ShowPatientApi = (params?: { q?: string; doctorId?: string; page?: number; limit?: number }) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(statusPatientStart())
      let response = await get(`patient`)
      const resData = response.data.success
      if (resData) {
        // dispatch(statusPatientSuccess(resData))
        const search = new URLSearchParams();
        if (params?.q) search.set("q", params.q);
        if (params?.doctorId) search.set("doctorId", params.doctorId);
        if (params?.page) search.set("page", String(params.page));
        if (params?.limit) search.set("limit", String(params.limit));

        const response = await get(`patient${search.toString() ? `?${search}` : ""}`)
        const success = response?.data?.success;
        if (success) {
          // success = { items, total, page, limit, pages, hasNext, hasPrev }
          const { items, ...meta } = success;
          dispatch(statusPatientSuccess({ items, meta }))
          return true
        }
      }
    } catch (error: any) {
      const errorData = error.response.data
      if (errorData && (error.response?.status === 300 || error.response?.status === 400)) {
        const formErrors = errorData.formErrors ?? [errorData]
        dispatch(statusPatientFailure(formErrors))
        return formErrors
      } else {
        dispatch(statusPatientFailure(errorData))
        return [errorData]
      }
    }
  }

export const AddPatientApi = (data: {}) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusPatientStart())
    let response = await post(`patient`, data)
    const resData = response.data.success
    if (resData) {
      dispatch(statusPatientSuccess(resData))
      return true
    }
  } catch (error: any) {
    const errorData = error.response.data
    if (errorData && error.response.status === 300) {
      const formErrors = errorData.formErrors ?? [errorData]
      dispatch(statusPatientFailure(formErrors))
      return formErrors
    } else {
      dispatch(statusPatientFailure(errorData))
      return [errorData]
    }
  }
}

export const EditPatientApi = (patientId: string, data: {}) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusPatientStart())
    let response = await put(`patient/${patientId}`, data)
    const resData = response.data.success
    if (resData) {
      dispatch(statusPatientSuccess(resData))
      return true
    }
  } catch (error: any) {
    const errorData = error.response.data
    if (errorData && error.response.status === 300) {
      const formErrors = errorData.formErrors ?? [errorData]
      dispatch(statusPatientFailure(formErrors))
      return formErrors
    } else {
      dispatch(statusPatientFailure(errorData))
      return [errorData]
    }
  }
}

export const DeletePatientApi = (patientId: string) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusPatientStart())
    let response = await remove(`patient/${patientId}`)
    const resData = response.data.success
    if (resData) {
      dispatch(statusPatientSuccess(resData))
      return true
    }
  } catch (error: any) {
    const errorData = error.response.data
    if (errorData && error.response.status === 300) {
      const formErrors = errorData.formErrors ?? [errorData]
      dispatch(statusPatientFailure(formErrors))
      return formErrors
    } else {
      dispatch(statusPatientFailure(errorData))
      return [errorData]
    }
  }
}

export const clearPatientApi = async (dispatch: Dispatch<any>) => {
  dispatch(statusPatientSuccess([]))
}
