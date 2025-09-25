// src/components/settings/BrandPreview.tsx
import React from "react";

type Props = {
  logoUrl?: string;
  faviconUrl?: string;
};

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-2xl border bg-white shadow-sm p-4">
    <h3 className="font-medium mb-2">{title}</h3>
    {children}
  </div>
);

const BrandPreview: React.FC<Props> = ({ logoUrl, faviconUrl, alt="Preview" }: any) => {
  console.log("logoUrl: ", logoUrl)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Logo */}
      <Card title="Aperçu du logo">
        <div className="flex items-center gap-4">
          <div className="w-40 h-16 rounded-lg bg-gray-50 border overflow-hidden flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt={alt} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs text-gray-400">Aucun logo</span>
            )}
          </div>
          <div className="w-24 h-24 rounded-lg bg-gray-50 border overflow-hidden flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt={alt} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
          </div>
        </div>
      </Card>

      {/* Favicon */}
      <Card title="Aperçu du favicon">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-lg bg-gray-50 border overflow-hidden flex items-center justify-center">
            {faviconUrl ? (
              <img src={faviconUrl} alt={alt} className="w-16 h-16 object-contain" />
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
          </div>
          <div className="w-8 h-8 rounded bg-gray-50 border overflow-hidden flex items-center justify-center">
            {faviconUrl ? (
              <img src={faviconUrl} alt={alt} className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-[10px] text-gray-400">—</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BrandPreview;
