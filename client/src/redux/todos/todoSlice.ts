// src/redux/todos/todoSlice.ts
import { createSlice } from "@reduxjs/toolkit";

type Todo = {
  _id: string;
  title: string;
  notes?: string;
  done: boolean;
  dueAt?: string | null;
  priority: "low" | "medium" | "high";
  createdAt?: string;
  updatedAt?: string;
};

type Meta = { total: number; page: number; pages: number; limit: number; hasNext: boolean; hasPrev: boolean };

const initialState: { items: Todo[]; meta?: Meta; loading: boolean; errors?: any } = {
  items: [],
  meta: undefined,
  loading: false,
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    statusTodosStart: (s) => { s.loading = true; s.errors = undefined; },
    statusTodosSuccess: (s, { payload }) => {
      s.loading = false;
      if (payload?.items) {
        s.items = payload.items;
        s.meta = payload.meta ?? s.meta;
      } else if (Array.isArray(payload)) {
        s.items = payload;
      } else {
        // single doc created/updated
        const doc = payload;
        const idx = s.items.findIndex((t) => t._id === doc._id);
        if (idx >= 0) s.items[idx] = doc; else s.items.unshift(doc);
      }
    },
    statusTodosFailure: (s, { payload }) => { s.loading = false; s.errors = payload; },
    removeTodoLocal: (s, { payload: id }) => {
      s.items = s.items.filter((t) => t._id !== id);
    },
  },
});

export const { statusTodosStart, statusTodosSuccess, statusTodosFailure, removeTodoLocal } = todoSlice.actions;
export default todoSlice.reducer;
