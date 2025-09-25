// src/redux/settings/settingsApiCalls.ts (refactor en thunks qui DISPATCHENT)
import { Dispatch } from "react";
import { get, put, post } from "../../requestMethods";
import { gsStart, gsSuccess, gsFailure } from "./generalSlice";

// FETCH
export const fetchGeneralSettings = () => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(gsStart());
    const res = await get("settings/general");
    dispatch(gsSuccess(res?.data?.success));
    return res?.data?.success; // pour que le composant puisse setState si besoin
  } catch (e: any) {
    dispatch(gsFailure([e?.response?.data || e?.message]));
    return null;
  }
};

// UPDATE
export const updateGeneralSettings = (payload: any) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(gsStart());
    const res = await put("settings/general", payload);
    dispatch(gsSuccess(res?.data?.success));
    return true;
  } catch (e: any) {
    dispatch(gsFailure([e?.response?.data || e?.message]));
    return false;
  }
};

// UPLOAD
export const uploadSettingsImage = (file: File, folder = "general", prevUrl?: string) => async () => {
  const fd = new FormData();
  fd.append("file", file);
  if (prevUrl) fd.append("prevUrl", prevUrl); // ← envoyé au serveur
  const res = await post(`uploads/image?folder=${encodeURIComponent(folder)}`, fd);
  const data = res?.data;
  if (!data?.success?.url) throw new Error(data?.err || "Upload échoué");
  return data.success.url as string;
};