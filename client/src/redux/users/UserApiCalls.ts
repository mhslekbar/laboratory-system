// src/redux/users/UserApiCalls.ts

import { Dispatch } from "react";
import { statusUserFailure, statusUserStart, statusUserSuccess } from "./userSlice";
import { get, post, put, remove } from "../../requestMethods";

export const ShowUserApi = (params?: { q?: string; page?: number; limit?: number; only?: "users" | "doctors" | "all" }) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusUserStart())
    // let response = await get(`user`)
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.only) qs.set("only", params.only);
    const url = qs.toString() ? `user?${qs.toString()}` : `user`;
    let response = await get(url)

    const resData = response.data.success
    if (resData) {
      dispatch(statusUserSuccess(resData))
      return true
    }
  } catch (error: any) {
    const errorData = error.response.data
    if (errorData && error.response.status === 300) {
      const formErrors = errorData.formErrors ?? [errorData]
      dispatch(statusUserFailure(formErrors))
      return formErrors
    } else {
      dispatch(statusUserFailure(errorData))
      return [errorData]
    }
  }
}

export type FetchDoctorsParams = { q?: string; page?: number; limit?: number };
export const fetchDoctors = async (params?: FetchDoctorsParams) => {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  
  const url = search.toString() ? `user/doctors?${search.toString()}` : ``;
  const res = await get(url);
  // backend renvoie { success: { items, total, page, ... } }
  return res?.data?.success ?? { items: [], total: 0, page: 1, pages: 1, limit: 20, hasNext: false, hasPrev: false };
};

export const AddUserApi = (data: {}) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusUserStart())
    let response = await post(`user`, data)
    const resData = response.data.success
    if (resData) {
      dispatch(statusUserSuccess(resData))
      return true
    }
  } catch (error: any) {
    const errorData = error.response.data
    if (errorData && error.response.status === 300) {
      const formErrors = errorData.formErrors ?? [errorData]
      dispatch(statusUserFailure(formErrors))
      return formErrors
    } else {
      dispatch(statusUserFailure(errorData))
      return [errorData]
    }
  }
}

export const EditUserApi = (userId: string, data: {}) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusUserStart())
    let response = await put(`user/${userId}`, data)
    const resData = response.data.success
    if (resData) {
      dispatch(statusUserSuccess(resData))
      return true
    }
  } catch (error: any) {
    const errorData = error.response.data
    if (errorData && error.response.status === 300) {
      const formErrors = errorData.formErrors ?? [errorData]
      dispatch(statusUserFailure(formErrors))
      return formErrors
    } else {
      dispatch(statusUserFailure(errorData))
      return [errorData]
    }
  }
}

export const DeleteUserApi = (userId: string) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusUserStart())
    let response = await remove(`user/${userId}`)
    const resData = response.data.success
    if (resData) {
      dispatch(statusUserSuccess(resData))
      return true
    }
  } catch (error: any) {
    const errorData = error.response.data
    if (errorData && error.response.status === 300) {
      const formErrors = errorData.formErrors ?? [errorData]
      dispatch(statusUserFailure(formErrors))
      return formErrors
    } else {
      dispatch(statusUserFailure(errorData))
      return [errorData]
    }
  }
}

export const clearUserApi = () => async (dispatch: Dispatch<any>) => {
  dispatch(statusUserSuccess([]))
}
