import { Dispatch } from "react";
import { casesStart, casesSuccess, casesFailure, setFilters } from "./doctorCasesSlice";
import { get, post } from "../../requestMethods";


export const fetchDoctorCases = (params?: { q?: string; doctorId?: string; status?: string; page?: number; limit?: number }) =>
  async (dispatch: Dispatch<any>, getState: any) => {
    try {
      dispatch(casesStart());

      // Take filters from state, override with params
      const { doctorCases } = getState();
      const f = { ...doctorCases.filters, ...(params || {}) };

      const qs = new URLSearchParams();
      if (f.q) qs.set("q", f.q);
      if (f.doctorId) qs.set("doctorId", f.doctorId);
      if (f.status) qs.set("status", f.status as string);
      if (f.page) qs.set("page", String(f.page));
      if (f.limit) qs.set("limit", String(f.limit));

      const res = await get(`doctor/cases${qs.toString() ? `?${qs}` : ""}`);
      const payload = res?.data?.success;
      if (!payload) throw new Error("Réponse invalide");
      dispatch(casesSuccess(payload));
      dispatch(setFilters({ ...f })); // persist filters

      return true;
    } catch (e: any) {
      const err = e?.response?.data || e?.message || "Erreur";
      dispatch(casesFailure(err));
      return false;
    }
  };

export const approveCaseApi = (id: string) =>
  async (dispatch: Dispatch<any>, getState: any) => {
    try {
      // 1) action côté serveur
      await post(`doctor/cases/${id}/approve`, {});

      // 2) refetch avec les filtres/pages courants
      const { doctorCases } = getState();
      const f = doctorCases.filters || {};
      const qs = new URLSearchParams();
      if (f.q)        qs.set("q", f.q);
      if (f.doctorId) qs.set("doctorId", f.doctorId);
      if (f.status)   qs.set("status", f.status);
      if (f.page)     qs.set("page", String(f.page));
      if (f.limit)    qs.set("limit", String(f.limit));

      const res = await get(`doctor/cases${qs.toString() ? `?${qs}` : ""}`);
      const payload = res?.data?.success;
      if (!payload) throw new Error("Réponse invalide");

      dispatch(casesSuccess(payload));
      return true;
    } catch (e: any) {
      // Tu peux aussi dispatch(casesFailure(...)) si tu veux remonter l’erreur à l’UI
      return false;
    }
  };