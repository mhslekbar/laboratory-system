import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  fetchGeneralSettings,
  updateGeneralSettings,
} from "../redux/settings/settingsApiCalls";
import SuccessMsg from "../Messages/SuccessMsg";
import BrandPreview from "../components/settings/BrandPreview";
import { hostName } from "../requestMethods";
import { resolveAssetUrl, toRelativeIfHosted } from "../Utils/url";
import Localizations from "../components/settings/Localizations";
import Company from "../components/settings/Company";

// Extra accept strings
const ACCEPT_LOGO = "image/png,image/jpeg,image/webp,image/svg+xml";
const ACCEPT_FAVICON = "image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml";

const SettingsPage: React.FC = () => {
  const dispatch: any = useDispatch();

  const [data, setData] = useState<any>({
    company: {
      name: "",
      legalName: "",
      taxId: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      logoUrl: "",
      faviconUrl: "",
    },
    localization: {
      defaultLanguage: "fr",
      timezone: "Africa/Nouakchott",
      defaultCurrency: "MRU",
      dateFormat: "DD/MM/YYYY",
      numberFormat: "1 234,56",
    },
    branding: {
      theme: { primaryColor: "#4f46e5", mode: "system" },
      printHeaderHTML: "",
      printFooterHTML: "",
    },
  });

  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await dispatch(fetchGeneralSettings());
      if (res) setData(res);
    })();
  }, [dispatch]);

  // Keep the tab icon synced with the chosen favicon
  useEffect(() => {
    const raw = data.company?.faviconUrl;
    if (!raw) return;
    const href = resolveAssetUrl(raw, hostName);
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href.includes("?") ? `${href}&t=${Date.now()}` : `${href}?t=${Date.now()}`;
  }, [data.company?.faviconUrl]);

  const save = async () => {
    setSaving(true);
    try {
      await dispatch(updateGeneralSettings(data));
      setOk(true);
      setTimeout(() => setOk(false), 1800);
    } finally {
      setSaving(false);
    }
  };

  // Upload handlers — keep relative path in state/DB
  const onLogoUploaded = (url: string) =>
    setData((d: any) => ({
      ...d,
      company: { ...d.company, logoUrl: toRelativeIfHosted(url, hostName) },
    }));

  const onFaviconUploaded = (url: string) =>
    setData((d: any) => ({
      ...d,
      company: { ...d.company, faviconUrl: toRelativeIfHosted(url, hostName) },
    }));

  return (
    <div className="space-y-6">
      {ok && <SuccessMsg modal={ok} toggle={() => setOk(false)} />}

      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Paramètres généraux</h1>
          <p className="text-sm text-gray-500">Identité d’entreprise, localisation et branding</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`rounded-lg px-4 py-2 text-white ${saving ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {/* Live preview */}
      <BrandPreview
        // alt="Preview"
        logoUrl={resolveAssetUrl(data.company.logoUrl, hostName)}
        faviconUrl={resolveAssetUrl(data.company.faviconUrl, hostName)}
      />

      {/* Company */}
      <Company
        data={data}
        setData={setData}
        onLogoUploaded={onLogoUploaded}
        ACCEPT_LOGO={ACCEPT_LOGO}
        onFaviconUploaded={onFaviconUploaded}
        ACCEPT_FAVICON={ACCEPT_FAVICON}
      />

      <Localizations data={data} setData={setData} />
            

      {/* <Branding data={data} setData={setData} /> */}

      {/* Sticky footer action on mobile */}
      <div className="md:hidden sticky bottom-3 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className={`rounded-lg px-4 py-2 text-white shadow ${saving ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
