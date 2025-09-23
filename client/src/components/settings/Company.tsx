// src/components/settings/Company.tsx
import React from "react";
import ImageUploader from "../../HtmlComponents/ImageUploader";
import { resolveAssetUrl } from "../../Utils/url";
import { hostName } from "../../requestMethods";
import { uploadSettingsImage } from "../../redux/settings/settingsApiCalls";
import { useDispatch } from "react-redux";

type Props = {
  data: any;
  setData: (val: any) => void;
  onLogoUploaded: (url: string) => void;
  ACCEPT_LOGO: string;
  onFaviconUploaded: (url: string) => void;
  ACCEPT_FAVICON: string;
};

const Company: React.FC<Props> = ({
  data,
  setData,
  onLogoUploaded,
  ACCEPT_LOGO,
  onFaviconUploaded,
  ACCEPT_FAVICON,
}) => {
  const dispatch: any = useDispatch();

  return (
    <section className="rounded-2xl border bg-white shadow-sm p-6 space-y-4">
      <h2 className="font-semibold">Entreprise</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* --- Inputs --- */}
        <div>
          <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
            Nom
          </label>
          <input
            id="company-name"
            className="input"
            value={data.company.name}
            onChange={(e) =>
              setData({ ...data, company: { ...data.company, name: e.target.value } })
            }
          />
        </div>

        <div>
          <label htmlFor="company-legalName" className="block text-sm font-medium text-gray-700">
            Raison sociale
          </label>
          <input
            id="company-legalName"
            className="input"
            value={data.company.legalName}
            onChange={(e) =>
              setData({ ...data, company: { ...data.company, legalName: e.target.value } })
            }
          />
        </div>

        <div>
          <label htmlFor="company-taxId" className="block text-sm font-medium text-gray-700">
            NIF / Tax ID
          </label>
          <input
            id="company-taxId"
            className="input"
            value={data.company.taxId}
            onChange={(e) =>
              setData({ ...data, company: { ...data.company, taxId: e.target.value } })
            }
          />
        </div>

        <div>
          <label htmlFor="company-phone" className="block text-sm font-medium text-gray-700">
            Téléphone
          </label>
          <input
            id="company-phone"
            className="input"
            value={data.company.phone}
            onChange={(e) =>
              setData({ ...data, company: { ...data.company, phone: e.target.value } })
            }
          />
        </div>

        <div>
          <label htmlFor="company-email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="company-email"
            className="input"
            value={data.company.email}
            onChange={(e) =>
              setData({ ...data, company: { ...data.company, email: e.target.value } })
            }
          />
        </div>

        <div>
          <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
            Site Web
          </label>
          <input
            id="company-website"
            className="input"
            value={data.company.website}
            onChange={(e) =>
              setData({ ...data, company: { ...data.company, website: e.target.value } })
            }
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="company-address" className="block text-sm font-medium text-gray-700">
            Adresse
          </label>
          <input
            id="company-address"
            className="input"
            value={data.company.address}
            onChange={(e) =>
              setData({ ...data, company: { ...data.company, address: e.target.value } })
            }
          />
        </div>

        {/* --- Uploaders --- */}
        <div className="md:col-span-1">
          <ImageUploader
            label="Logo"
            currentUrl={resolveAssetUrl(data.company.logoUrl, hostName)}
            onUploaded={onLogoUploaded}
            folder="logos"
            // Send prevUrl to backend so old logo is deleted
            uploadFn={(file, folder) => {
              return dispatch(uploadSettingsImage(file, folder, data.company.logoUrl || undefined))
            }
              
            }
            accept={ACCEPT_LOGO}
            hint="PNG/JPG/WebP/SVG — recommandé: fond transparent, horizontal"
            maxMB={5}
          />
        </div>

        <div className="md:col-span-1">
          <ImageUploader
            label="Favicon"
            currentUrl={resolveAssetUrl(data.company.faviconUrl, hostName)}
            onUploaded={onFaviconUploaded}
            folder="favicons"
            // Send prevUrl to backend so old favicon is deleted
            uploadFn={(file, folder) =>
              dispatch(uploadSettingsImage(file, folder, data.company.faviconUrl || undefined))
            }
            accept={ACCEPT_FAVICON}
            hint="ICO/PNG/SVG — conseillé: carré (32×32 ou 64×64)"
            maxMB={2}
          />
        </div>
      </div>
    </section>
  );
};

export default Company;
