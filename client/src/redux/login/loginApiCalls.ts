// src/redux/login/loginApiCalls.ts
import { Dispatch } from "react"
import { statusLoginStart, statusLoginSuccess, statusLoginFailure } from "./loginSlice"
import { publicRequest } from "../../requestMethods"

export const loginApi = (data: object) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusLoginStart())
    const response = await publicRequest.post("auth/login", data)
    const resData = response.data.success
    if(resData) {
      dispatch(statusLoginSuccess(resData))
      return true
    }
  } catch(err: any) {
    const errData = err.response.data
    
    const formErrors = errData.formErrors ? errData.formErrors : [errData];
    if(err.response && err.response.status) {
      dispatch(statusLoginFailure(formErrors))
      return formErrors
    } else {
      dispatch(statusLoginFailure(errData.err))
      return [errData.err]  
    }
  }
}

export const logoutApi = () => async (dispatch: Dispatch<any>) => {
  dispatch(statusLoginSuccess({}))
}

