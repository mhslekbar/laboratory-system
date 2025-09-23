import { Dispatch } from "react"
import { RoleAction, RoleStatus, RoleType }  from "./roleActions"
import { get, post, put, remove } from "../../requestMethods"

export const showRolesApi = () => async (dispatch: Dispatch<RoleAction>) => {
  try {
    dispatch({ type: { name: "role", method: RoleType.SHOW_ROLES }, status: RoleStatus.START })
    const response = await get(`role`)
    const resData = response.data.success
    if(resData) {
      dispatch({ type: { name: "role", method: RoleType.SHOW_ROLES }, status: RoleStatus.SUCCESS, payload: resData })
      return true
    }
  } catch(error: any) {
    const errorData = error.response?.data
    if(errorData && error.response.status === 300) {
      const formErrors = errorData.formErrors ? errorData.formErrors : [errorData]
      dispatch({ type: { name: "role", method: RoleType.SHOW_ROLES }, status: RoleStatus.FAILURE, payload: formErrors })
      return formErrors
    } else {
      dispatch({ type: { name: "role", method: RoleType.SHOW_ROLES }, status: RoleStatus.FAILURE, payload: [errorData.err] })
      return [errorData.err]
    }
  }
}


export const addRoleApi = (data: object) => async (dispatch: Dispatch<RoleAction>) => {
  try {
    dispatch({ type: { name: "role", method: RoleType.ADD_ROLE } , status: RoleStatus.START })
    const response = await post(`role`, data)
    const resData = response.data.success
    if(resData) {
      dispatch({ type: { name: "role", method: RoleType.ADD_ROLE }, status: RoleStatus.SUCCESS, payload: resData })
      return true
    }
  } catch(error: any) {
    const errorData = error.response?.data
    if(errorData && error.response.status === 300) {
      const formErrors = errorData.formErrors ? errorData.formErrors : [errorData]
      dispatch({ type: { name: "role", method: RoleType.ADD_ROLE }, status: RoleStatus.FAILURE, payload: formErrors })
      return formErrors
    } else {
      dispatch({ type: { name: "role", method: RoleType.ADD_ROLE }, status: RoleStatus.FAILURE, payload: [errorData.err] })
      return [errorData.err]
    }
  }
}

export const editRoleApi = (roleId: string, data: object) => async (dispatch: Dispatch<RoleAction>) => {
  try {
    dispatch({ type: { name: "role", method: RoleType.EDIT_ROLE }, status: RoleStatus.START })
    const response = await put(`role/${roleId}`, data)
    const resData = response.data.success
    if(resData) {
      dispatch({ type: { name: "role", method: RoleType.EDIT_ROLE }, status: RoleStatus.SUCCESS, payload: resData })
      return true
    }
  } catch(error: any) {
    const errorData = error.response?.data
    if(errorData && error.response.status === 300) {
      const formErrors = errorData.formErrors ? errorData.formErrors : [errorData]
      dispatch({ type: { name: "role", method: RoleType.EDIT_ROLE }, status: RoleStatus.FAILURE, payload: formErrors })
      return formErrors
    } else {
      dispatch({ type: { name: "role", method: RoleType.EDIT_ROLE }, status: RoleStatus.FAILURE, payload: [errorData.err] })
      return [errorData.err]
    }
  }
}

export const deleteRoleApi = (roleId: string) => async (dispatch: Dispatch<RoleAction>) => {
  try {
    dispatch({ type: { name: "role", method: RoleType.DELETE_ROLE }, status: RoleStatus.START })
    const response = await remove(`role/${roleId}`)
    const resData = response.data.success
    if(resData) {
      dispatch({ type: { name: "role", method: RoleType.DELETE_ROLE }, status: RoleStatus.SUCCESS, payload: resData })
      return true
    }
  } catch(error: any) {
    const errorData = error.response?.data
    if(errorData && error.response.status === 300) {
      const formErrors = errorData.formErrors ? errorData.formErrors : [errorData]
      dispatch({ type: { name: "role", method: RoleType.DELETE_ROLE }, status: RoleStatus.FAILURE, payload: formErrors })
      return formErrors
    } else {
      dispatch({ type: { name: "role", method: RoleType.DELETE_ROLE }, status: RoleStatus.FAILURE, payload: [errorData.err] })
      return [errorData.err]
    }
  }
}

export const clearRoleApi = () => async (dispatch: Dispatch<any>) => {
  dispatch({ type: { name: "role", method: RoleType.CLEAR_ROLE }, status: RoleStatus.SUCCESS, payload: [] })
}
