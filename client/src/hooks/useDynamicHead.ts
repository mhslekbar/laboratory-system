import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchGeneralSettings } from "../redux/settings/settingsApiCalls";
import { hostName } from "../requestMethods";

export default function useDynamicHead() {
  const [settings, setSettings] = useState<any>(null);
  const dispatch: any = useDispatch();

  // Charger les settings
  useEffect(() => {
    (async () => {
      const res = await dispatch(fetchGeneralSettings());
      if (res) setSettings(res);
    })();
  }, [dispatch]);

  // Appliquer dans <head>
  useEffect(() => {
    if (!settings) return;

    // === Title ===
    if (settings?.company?.name) {
      document.title = settings.company.name;
    }

    // === Favicon ===
    if (settings?.company?.faviconUrl) {
      const href = `${hostName}${settings.company.faviconUrl}`;
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      // ajout d’un timestamp pour forcer le rafraîchissement
      link.href = href.includes("?") ? `${href}&t=${Date.now()}` : `${href}?t=${Date.now()}`;
    }

    // === Couleur du thème (mobile address bar par ex.) ===
    if (settings?.branding?.theme?.primaryColor) {
      let meta = document.querySelector("meta[name='theme-color']") as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      meta.content = settings.branding.theme.primaryColor;
    }
  }, [settings]);
}
