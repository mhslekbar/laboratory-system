// src/redux/todos/todoApiCalls.ts
import { Dispatch } from "react";
import { get, post, put, remove } from "../../requestMethods";
import { statusTodosFailure, statusTodosStart, statusTodosSuccess, removeTodoLocal } from "./todoSlice";

export const fetchTodos = (params?: {
  q?: string;
  status?: "open" | "done" | "all";
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  sort?: "dueAsc" | "dueDesc" | "createdDesc" | "createdAsc" | "priority";
}) => async (dispatch: Dispatch<any>) => {
  try {
    dispatch(statusTodosStart());
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.dateFrom) qs.set("dateFrom", params.dateFrom);
    if (params?.dateTo) qs.set("dateTo", params.dateTo);
    if (params?.sort) qs.set("sort", params.sort);

    const url = `todos${qs.toString() ? `?${qs}` : ""}`;
    const res = await get(url);
    const success = res?.data?.success;
    if (success) {
      const { items, ...meta } = success;
      dispatch(statusTodosSuccess({ items, meta }));
    }
    return true;
  } catch (e: any) {
    dispatch(statusTodosFailure(e?.response?.data || e?.message));
    return false;
  }
};

export const addTodo = (payload: { title: string; notes?: string; dueAt?: string | null; priority?: "low"|"medium"|"high"; assignedTo?: string | null }) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(statusTodosStart());
      const res = await post("todos", payload);
      const doc = res?.data?.success;
      if (doc) dispatch(statusTodosSuccess(doc));
      return true;
    } catch (e: any) {
      dispatch(statusTodosFailure(e?.response?.data || e?.message));
      return false;
    }
  };

export const toggleTodo = (id: string, done: boolean) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(statusTodosStart());
      const res = await put(`todos/${id}`, { done });
      const doc = res?.data?.success;
      if (doc) dispatch(statusTodosSuccess(doc));
      return true;
    } catch (e: any) {
      dispatch(statusTodosFailure(e?.response?.data || e?.message));
      return false;
    }
  };

export const updateTodo = (id: string, patch: Partial<{ title: string; notes?: string; dueAt?: string | null; priority?: "low"|"medium"|"high"; assignedTo?: string | null }>) =>
  async (dispatch: Dispatch<any>) => {
    try {
      dispatch(statusTodosStart());
      const res = await put(`todos/${id}`, patch);
      const doc = res?.data?.success;
      if (doc) dispatch(statusTodosSuccess(doc));
      return true;
    } catch (e: any) {
      dispatch(statusTodosFailure(e?.response?.data || e?.message));
      return false;
    }
  };

export const deleteTodo = (id: string) =>
  async (dispatch: Dispatch<any>) => {
    try {
      // Optimistic
      dispatch(removeTodoLocal(id));
      await remove(`todos/${id}`);
      return true;
    } catch (e: any) {
      // (optionnel) refetch si erreur
      dispatch(statusTodosFailure(e?.response?.data || e?.message));
      return false;
    }
  };
