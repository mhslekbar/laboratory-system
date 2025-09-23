// src/redux/cases/slice.ts
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isFetching: false,
  items: [] as any[],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  },
  error: [] as string[],
};

const slice = createSlice({
  name: "cases",
  initialState,
  reducers: {
    casesStart: (s) => {
      s.isFetching = true;
      s.error = [];
    },
    casesSuccess: (s, a) => {
      s.isFetching = false;
      s.items = a.payload?.items || [];
      s.meta = { ...(s.meta), ...(a.payload?.meta || {}) };
    },
    casesFailure: (s, a) => {
      s.isFetching = false;
      s.error = a.payload || ["Erreur inconnue"];
    },
  },
});

export const { casesStart, casesSuccess, casesFailure } = slice.actions;
export default slice.reducer;
