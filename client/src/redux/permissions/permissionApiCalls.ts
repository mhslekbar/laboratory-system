import { Dispatch } from "react"
import { statusPermissionStart, statusPermissionSuccess, statusPermissionFailure } from "./permissionSlice"
import { get, post, put, remove } from "../../requestMethods"

export const ShowPermissionApi = (filter: string = "") => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusPermissionStart())
    let response
    if(filter) {
      response = await get(`permission${filter}`)
    } else {
      response = await get(`permission`)
    }
    const resData = response.data.success
    if(resData) {
      dispatch(statusPermissionSuccess(resData))
      return true
    }
  } catch (error: any) {
    const errData = error.response.data
    if(errData && error.response.status === 300) {
      const formErrors = errData.formErrors ? errData.formErrors : [errData]
      dispatch(statusPermissionFailure(formErrors))
      return formErrors
    } else {
      dispatch(statusPermissionFailure([errData.err]))
      return [errData.err]
    }
  }
}

export const AddPermissionApi = (data: {}) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusPermissionStart())
    let response = await post('permission', data)
    const resData = response.data.success
    if(resData) {
      dispatch(statusPermissionSuccess(resData))
      return true
    }
  } catch (error: any) {
    const errData = error.response.data
    if(errData && error.response.status === 300) {
      const formErrors = errData.formErrors ? errData.formErrors : [errData]
      dispatch(statusPermissionFailure(formErrors))
      return formErrors
    } else {
      dispatch(statusPermissionFailure([errData.err]))
      return [errData.err]
    }
  }
}

export const EditPermissionApi = (permissionId: string, data: {}) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusPermissionStart())
    let response = await put(`permission/${permissionId}`, data)
    const resData = response.data.success
    if(resData) {
      dispatch(statusPermissionSuccess(resData))
      return true
    }
  } catch (error: any) {
    const errData = error.response.data
    if(errData && error.response.status === 300) {
      const formErrors = errData.formErrors ? errData.formErrors : [errData]
      dispatch(statusPermissionFailure(formErrors))
      return formErrors
    } else {
      dispatch(statusPermissionFailure([errData.err]))
      return [errData.err]
    }
  }
}

export const DeletePermissionApi = (permissionId: string) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusPermissionStart())
    let response = await remove(`permission/${permissionId}`)
    const resData = response.data.success
    if(resData) {
      dispatch(statusPermissionSuccess(resData))
      return true
    }
  } catch (error: any) {
    const errData = error.response.data
    if(errData && error.response.status === 300) {
      const formErrors = errData.formErrors ? errData.formErrors : [errData]
      dispatch(statusPermissionFailure(formErrors))
      return formErrors
    } else {
      dispatch(statusPermissionFailure([errData.err]))
      return [errData.err]
    }
  }
}


// ===== Bulk create many =====
export const AddManyPermissionsApi = (permissions: Array<{ name: string; collectionName: string }>) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(statusPermissionStart());
      const response = await post("permission/many", { permissions });
      const resData = response.data.success;
      if (resData) {
        dispatch(statusPermissionSuccess(resData));
        return true;
      }
    } catch (error: any) {
      const errData = error?.response?.data;
      if (errData && error.response?.status === 300) {
        const formErrors = errData.formErrors ? errData.formErrors : [errData];
        dispatch(statusPermissionFailure(formErrors));
        return formErrors;
      } else {
        const msg = errData?.err || "Erreur inconnue";
        dispatch(statusPermissionFailure([msg]));
        return [msg];
      }
    }
  };

// ===== Delete all =====
export const DeleteAllPermissionsApi = () => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusPermissionStart());
    const response = await remove("permission"); // DELETE /permission
    const resData = response.data.success;
    if (resData) {
      dispatch(statusPermissionSuccess(resData));
      return true;
    }
  } catch (error: any) {
    const errData = error?.response?.data;
    if (errData && error.response?.status === 300) {
      const formErrors = errData.formErrors ? errData.formErrors : [errData];
      dispatch(statusPermissionFailure(formErrors));
      return formErrors;
    } else {
      const msg = errData?.err || "Erreur inconnue";
      dispatch(statusPermissionFailure([msg]));
      return [msg];
    }
  }
};

export const clearPermissionApi = () => (dispatch: Dispatch<any>) => {
  dispatch(statusPermissionSuccess([]))
}

