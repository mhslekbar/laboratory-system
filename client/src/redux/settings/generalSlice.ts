// src/redux/settings/generalSlice.ts
import { createSlice } from "@reduxjs/toolkit";

export type GeneralSettings = {
  company?: {
    name?: string; legalName?: string; taxId?: string; address?: string;
    phone?: string; email?: string; website?: string;
    logoUrl?: string; faviconUrl?: string;
  };
  localization?: {
    defaultLanguage?: "fr"|"ar"|"en";
    timezone?: string; defaultCurrency?: string; dateFormat?: string; numberFormat?: string;
  };
  branding?: {
    theme?: { primaryColor?: string; mode?: "light"|"dark"|"system" };
    printHeaderHTML?: string; printFooterHTML?: string;
  };
};

type State = {
  isFetching: boolean;
  data: GeneralSettings | null;
  error: string[];
};

const initialState: State = { isFetching: false, data: null, error: [] };

const slice = createSlice({
  name: "generalSettings",
  initialState,
  reducers: {
    gsStart:  (s) => { s.isFetching = true; s.error = []; },
    gsSuccess:(s,a) => { s.isFetching = false; s.data = a.payload || null; },
    gsFailure:(s,a) => { s.isFetching = false; s.error = a.payload || ["Erreur inconnue"]; },
    gsPatchLocal:(s,a)=> { s.data = { ...(s.data||{}), ...(a.payload||{}) }; },
  },
});

export const { gsStart, gsSuccess, gsFailure, gsPatchLocal } = slice.actions;
export default slice.reducer;
