// src/userSlice.ts

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isFetching: false,
  users: [],
  error: [],
  // pagination/search
  page: 1,
  limit: 10,
  total: 0,
  pages: 1,
  hasNext: false,
  hasPrev: false,
  q: "",
}

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    statusUserStart: (state) => {
      state.isFetching = true;
      state.error = [];
    },
    statusUserSuccess: (state: any, action) => {
      state.isFetching = false;
      const payload = action.payload || [];
      state.error = [];
      // 2 cas : (1) array "legacy"  (2) objet paginé { items, total, page, limit, pages, hasNext, hasPrev }
      if (Array.isArray(payload)) {
        state.users = payload;
        state.total = payload.length;
        state.page = 1;
        state.pages = 1;
        state.hasNext = false;
        state.hasPrev = false;
      } else {
        state.users = payload.items || [];
        state.total = payload.total ?? 0;
        state.page = payload.page ?? 1;
        state.limit = payload.limit ?? state.limit;
        state.pages = payload.pages ?? 1;
        state.hasNext = !!payload.hasNext;
        state.hasPrev = !!payload.hasPrev;
      }
    },
    statusUserFailure: (state, action) => {
      state.isFetching = false;
      if (action.payload[0]?.startsWith("AFFICHER")) {
        state.users = [];
      }
      state.error = action.payload || [];
    },
    // (optionnel) setters si tu veux piloter depuis l’UI
    setUserQuery: (state, action) => { state.q = action.payload ?? ""; },
    setUserPage: (state, action) => { state.page = action.payload ?? 1; },
    setUserLimit: (state, action) => { state.limit = action.payload ?? 10; },

  }
});

export const { statusUserStart, statusUserSuccess, statusUserFailure, setUserQuery, setUserPage, setUserLimit } = userSlice.actions;

export default userSlice.reducer;
