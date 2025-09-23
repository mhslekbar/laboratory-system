import { Store } from "@reduxjs/toolkit";
import { State } from "../redux/store";
import i18n from "../translations/i18n";

type Theme = "light" | "dark";
type Dir = "rtl" | "ltr";

/** Lecture sûre du localStorage */
function safeGet(key: string) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
/** Écriture sûre du localStorage (n’écrit que si nécessaire) */
function safeSet(key: string, value: string) {
  try {
    if (safeGet(key) !== value) window.localStorage.setItem(key, value);
  } catch {}
}

/** Crée/MAJ la meta theme-color (barre adresse mobile) */
function setMetaThemeColor(color?: string) {
  const defaultColor = "#111827"; // fallback en dark
  const content = color || defaultColor;

  let meta = document.querySelector("meta[name='theme-color']") as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  if (meta.content !== content) meta.content = content;
}

/** Applique le thème, la direction, et stocke les préférences */
export function applyDOMSettings(opts: { theme: Theme; dir: Dir; themeColor?: string }) {
  const { theme, dir, themeColor } = opts;

  // === Theme (classe "dark" sur <html>) ===
  const root = document.documentElement;
  const hasDark = root.classList.contains("dark");
  if (theme === "dark" && !hasDark) root.classList.add("dark");
  if (theme === "light" && hasDark) root.classList.remove("dark");
  safeSet("theme", theme);

  // === Direction ===
  if (document.documentElement.dir !== dir) document.documentElement.dir = dir;
  if (document.body.dir !== dir) document.body.dir = dir;
  safeSet("dir", dir);

  // === Meta theme-color (optionnelle, via settings/branding) ===
  setMetaThemeColor(themeColor);
}

/** 
 * Initialise les settings UI depuis le storage (utile au démarrage de l’app
 * avant le rendu, pour éviter un flash).
 */
export function initDOMFromStorage(defaults: { theme: Theme; dir: Dir; themeColor?: string }) {
  const storedTheme = (safeGet("theme") as Theme) || defaults.theme;
  const storedDir = (safeGet("dir") as Dir) || defaults.dir;

  applyDOMSettings({
    theme: storedTheme,
    dir: storedDir,
    themeColor: defaults.themeColor,
  });
}

/**
 * Synchronise l’état Redux settings -> DOM + i18n + localStorage
 * Appeler une seule fois après la création du store.
 */
export function syncSettings(store: Store<State>) {
  // Application initiale
  const s0 = store.getState().settings;
  applyDOMSettings({
    theme: s0.theme as Theme,
    dir: s0.dir as Dir,
    // Si tu stockes la couleur primaire dans settings.branding.theme.primaryColor :
    themeColor: (s0 as any)?.branding?.theme?.primaryColor,
  });

  // i18n initial
  i18n.changeLanguage(s0.lang);
  safeSet("lang", s0.lang);

  // Écoute des changements
  let prev = s0;
  store.subscribe(() => {
    const st = store.getState().settings;
    if (st === prev) return;

    // DOM
    applyDOMSettings({
      theme: st.theme as Theme,
      dir: st.dir as Dir,
      themeColor: (st as any)?.branding?.theme?.primaryColor,
    });

    // i18n
    if (st.lang !== prev.lang) {
      i18n.changeLanguage(st.lang);
      safeSet("lang", st.lang);
    }

    prev = st;
  });
}
