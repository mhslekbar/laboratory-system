// src/patientSlice.ts

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isFetching: false,
  patients: [] as any[],
  meta: { total: 0, page: 1, limit: 10, pages: 1, hasNext: false, hasPrev: false },
  error: []
}

const patientSlice = createSlice({
  name: "patient",
  initialState: initialState,
  reducers: {
    statusPatientStart: (state) => {
      state.isFetching = true;
      state.error = [];
    },
    statusPatientSuccess: (state, action) => {
      state.isFetching = false;
      // state.patients = action.payload || [];
      // payload = { items, meta }
      state.patients = action.payload?.items || [];
      state.meta = action.payload?.meta || initialState.meta;
      state.error = [];
    },
    statusPatientFailure: (state, action) => {
      state.isFetching = false;
      if (action.payload[0]?.startsWith("AFFICHER")) {
        state.patients = [];
      }
      state.error = action.payload || [];
    }
  }
});

export const { statusPatientStart, statusPatientSuccess, statusPatientFailure } = patientSlice.actions;

export default patientSlice.reducer;
