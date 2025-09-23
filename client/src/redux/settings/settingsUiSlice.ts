// src/redux/settings/settingsUiSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ThemeMode = "light" | "dark" | "system";
type Lang = "fr" | "ar" | "en";
type Dir = "ltr" | "rtl";

type State = {
  lang: Lang;
  theme: ThemeMode;
  dir: Dir;
};

const initialState: State = {
  lang: "fr",
  theme: "system",
  dir: "ltr",
};

const slice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLang: (s, a: PayloadAction<Lang>) => {
      s.lang = a.payload;
      s.dir = a.payload === "ar" ? "rtl" : "ltr";
      // éventuel side-effect: document.dir = s.dir;
    },
    toggleTheme: (s) => {
      s.theme = s.theme === "dark" ? "light" : "dark";
    },
    setTheme: (s, a: PayloadAction<ThemeMode>) => {
      s.theme = a.payload;
    },
  },
});

export const { setLang, toggleTheme, setTheme } = slice.actions;
export default slice.reducer;
