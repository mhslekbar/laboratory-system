// src/redux/measurementTypes/slice.ts
import { createSlice } from "@reduxjs/toolkit";

type Meta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

const initialState = {
  isFetching: false,
  items: [] as any[],
  meta: { total: 0, page: 1, limit: 10, pages: 1, hasNext: false, hasPrev: false } as Meta,
  error: [] as string[],
};

const slice = createSlice({
  name: "measurementTypes",
  initialState,
  reducers: {
    mtStart: (s) => {
      s.isFetching = true;
      s.error = [];
    },
    mtSuccess: (s, a) => {
      s.isFetching = false;
      s.items = a.payload?.items || [];
      s.meta = { ...(s.meta), ...(a.payload?.meta || {}) };
    },
    mtFailure: (s, a) => {
      s.isFetching = false;
      s.error = a.payload || ["Erreur inconnue"];
    },
  },
});

export const { mtStart, mtSuccess, mtFailure } = slice.actions;
export default slice.reducer;
