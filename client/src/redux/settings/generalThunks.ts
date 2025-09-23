// src/redux/settings/generalThunks.ts
import { Dispatch } from "react";
import { get, put, post } from "../../requestMethods";
import { gsStart, gsSuccess, gsFailure, gsPatchLocal } from "./generalSlice";

// ---- FETCH ----
export const fetchGeneralSettings = () => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(gsStart());
    const res = await get("settings/general");
    const data = res?.data?.success;
    dispatch(gsSuccess(data));
    return true;
  } catch (e: any) {
    dispatch(gsFailure([e?.response?.data || e?.message]));
    return false;
  }
};

// ---- UPDATE ----
export const updateGeneralSettings =
  (payload: any) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(gsStart());
      const res = await put("settings/general", payload);
      const data = res?.data?.success;
      dispatch(gsSuccess(data));
      return true;
    } catch (e: any) {
      dispatch(gsFailure([e?.response?.data || e?.message]));
      return false;
    }
  };

// ---- UPLOAD IMAGE (multipart) ----
// retourne aussi l'URL (utile au composant) et peut patcher localement si tu veux
export const uploadSettingsImage =
  (file: File, folder: string = "general", patchKey?: string) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(gsStart()); // ou un start dédié upload si tu veux un état distinct
      const fd = new FormData();
      fd.append("file", file);

      const res = await post(
        `uploads/image?folder=${encodeURIComponent(folder)}`,
        fd
      );

      const success = res?.data?.success;
      if (!success) {
        throw new Error(res?.data?.err || "Upload échoué");
      }

      const url: string = success.url;
      // Optionnel: mettre à jour le store localement (ex: branding.logoUrl)
      if (patchKey) {
        // patchKey ex: "branding.logoUrl" / "branding.faviconUrl"
        // simple patch ↓ (si tu veux du deep-set propre, fais une petite util)
        const patch: any = {};
        if (patchKey === "branding.logoUrl") patch.branding = { logoUrl: url };
        else if (patchKey === "branding.faviconUrl") patch.branding = { faviconUrl: url };
        dispatch(gsPatchLocal(patch));
      } else {
        // sinon au moins enlever le spinner
        dispatch(gsSuccess((s: any) => s));
      }

      return url;
    } catch (e: any) {
      dispatch(gsFailure([e?.response?.data || e?.message]));
      throw e; // pour que le composant sache que l'upload a échoué
    }
  };
