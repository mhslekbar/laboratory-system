import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DeliveryStatus = "pending" | "ready" | "completed";

export type CaseVM = {
  id: string;                 // server's toJSON transform adds id
  code: string;
  doctor?: { id?: string; username?: string; fullName?: string };
  patient?: { id?: string; name?: string; phone?: string };
  type?: { id?: string; key?: string; name?: string };
  note?: string;

  stages?: Array<{
    key: string; name: string; order: number;
    status: "pending" | "in_progress" | "done";
    color?: string; startedAt?: string; finishedAt?: string; note?: string;
  }>;
  currentStageOrder?: number;
  delivery?: { status: DeliveryStatus; readyAt?: string; deliveredAt?: string; receivedBackAt?: string };
  caseApproval?: { approved?: boolean; approvedAt?: string; by?: string };

  createdAt?: string;
  updatedAt?: string;
};

export type CasesPage = {
  items: CaseVM[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasPrev: boolean;
  hasNext: boolean;
};

type Filters = {
  q?: string;
  status?: DeliveryStatus | ""; // delivery.status sent to API
  page?: number;
  limit?: number;
  doctorId?: string;            // ← ADD: on le persiste, utile pour les refetch
};

type State = {
  loading: boolean;
  error?: string[] | string;
  data: CasesPage;
  filters: Filters;
};

const emptyPage: CasesPage = {
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  limit: 10,
  hasPrev: false,
  hasNext: false,
};

const initialState: State = {
  loading: false,
  data: emptyPage,
  filters: { q: "", status: "", page: 1, limit: 10 },
};

const slice = createSlice({
  name: "doctorCases",
  initialState,
  reducers: {
    casesStart: (s) => {
      s.loading = true;
      s.error = undefined;
    },
    casesSuccess: (s, a: PayloadAction<CasesPage>) => {
      s.loading = false;
      s.data = a.payload;
    },
    casesFailure: (s, a: PayloadAction<any>) => {
      s.loading = false;
      s.error = a.payload;
    },
    setFilters: (s, a: PayloadAction<Partial<Filters>>) => {
      s.filters = { ...s.filters, ...a.payload };
    },
    updateOneLocal: (s, a: PayloadAction<CaseVM>) => {
      const i = s.data.items.findIndex(x => x.id === a.payload.id);
      if (i >= 0) s.data.items[i] = a.payload;
      else s.data.items.unshift(a.payload);
    },
  },
});

export const {
  casesStart, casesSuccess, casesFailure, setFilters, updateOneLocal
} = slice.actions;

export default slice.reducer;
