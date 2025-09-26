// src/hooks/useDynamicHead.ts
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchGeneralSettings } from "../redux/settings/settingsApiCalls";
import { hostName } from "../requestMethods";

type Settings = {
  company?: {
    name?: string;
    description?: string;      // optional: if you store it
    logoUrl?: string;
    faviconUrl?: string;
    website?: string;
  };
  branding?: {
    theme?: { primaryColor?: string };
    ogImageUrl?: string;       // optional: if you store it
  };
};

function upsertLink(rel: string, attrs: Record<string, string>) {
  let el = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => {
    el!.setAttribute(k, v);
  });
  return el!;
}

function upsertMeta(nameOrProperty: { name?: string; property?: string }, content: string) {
  const selector = nameOrProperty.name
    ? `meta[name='${nameOrProperty.name}']`
    : `meta[property='${nameOrProperty.property}']`;

  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    if (nameOrProperty.name) el.name = nameOrProperty.name;
    if (nameOrProperty.property) el.setAttribute("property", nameOrProperty.property);
    document.head.appendChild(el);
  }
  el.content = content;
  return el!;
}

export default function useDynamicHead() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const dispatch: any = useDispatch();

  // Load settings once
  useEffect(() => {
    (async () => {
      try {
        const res = await dispatch(fetchGeneralSettings());
        if (res) setSettings(res as Settings);
      } catch {
        // ignore
      }
    })();
  }, [dispatch]);

  // Apply <head> changes whenever settings change
  useEffect(() => {
    if (!settings) return;

    const company = settings.company || {};
    const branding = settings.branding || {};
    const theme = branding.theme || {};
    const t = Date.now(); // cache-bust param

    // === Title ===
    if (company.name) document.title = company.name;

    // === Meta description (fallback to existing if none) ===
    const description =
      company.description ||
      "Modern laboratory management system for dental labs.";
    upsertMeta({ name: "description" }, description);

    // === Theme color ===
    if (theme.primaryColor) {
      upsertMeta({ name: "theme-color" }, theme.primaryColor);
      // iOS PWA status bar can use apple-status-bar-style, but we keep default.
    }

    // === Favicon (PNG/ICO) ===
    if (company.faviconUrl) {
      const href = `${hostName}${company.faviconUrl}${company.faviconUrl.includes("?") ? "&" : "?"}t=${t}`;
      upsertLink("icon", { href });
      // Some browsers still check shortcut icon:
      upsertLink("shortcut icon", { href });
    }

    // === Apple touch icon (180x180 recommended) ===
    if (company.logoUrl) {
      const appleHref = `${hostName}${company.logoUrl}${company.logoUrl.includes("?") ? "&" : "?"}t=${t}`;
      upsertLink("apple-touch-icon", { href: appleHref, sizes: "180x180" });
      // (Optional) Safari pinned tabs (monochrome SVG) if you have one:
      // upsertLink("mask-icon", { href: `${hostName}/icons/safari-pinned-tab.svg`, color: theme.primaryColor || "#000000" });
    }

    // === OpenGraph (social share) ===
    const ogTitle = company.name || "LAB SYSTEM";
    upsertMeta({ property: "og:title" }, ogTitle);
    upsertMeta({ property: "og:type" }, "website");
    upsertMeta({ property: "og:site_name" }, ogTitle);
    upsertMeta({ property: "og:description" }, description);
    if (company.website) upsertMeta({ property: "og:url" }, company.website);

    const ogImage =
      branding.ogImageUrl ||
      (company.logoUrl ? `${hostName}${company.logoUrl}?t=${t}` : "");
    if (ogImage) upsertMeta({ property: "og:image" }, ogImage);

    // === Bust manifest cache so icons update after changes ===
    const manifest = document.querySelector("link[rel='manifest']") as HTMLLinkElement | null;
    if (manifest) {
      const base = manifest.getAttribute("href") || "/manifest.json";
      const hasQuery = /\?/.test(base);
      manifest.setAttribute("href", `${base}${hasQuery ? "&" : "?"}t=${t}`);
    }
  }, [settings]);

  return settings; // handy if you want to read them in the component
}
