import React from "react";

const Localizations = ({ data, setData }: any) => {
  return (
    <section className="rounded-2xl border bg-white shadow-sm p-6 space-y-4">
      <h2 className="font-semibold">Localisation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="loc-lang"
            className="block text-sm font-medium text-gray-700"
          >
            Langue par défaut
          </label>
          <input
            id="loc-lang"
            className="input"
            value={data?.localization?.defaultLanguage}
            onChange={(e) =>
              setData({
                ...data,
                localization: {
                  ...data?.localization,
                  defaultLanguage: e.target.value,
                },
              })
            }
          />
        </div>

        <div>
          <label
            htmlFor="loc-tz"
            className="block text-sm font-medium text-gray-700"
          >
            Fuseau horaire
          </label>
          <input
            id="loc-tz"
            className="input"
            value={data?.localization.timezone}
            onChange={(e) =>
              setData({
                ...data,
                localization: {
                  ...data.localization,
                  timezone: e.target.value,
                },
              })
            }
          />
        </div>

        <div>
          <label
            htmlFor="loc-cur"
            className="block text-sm font-medium text-gray-700"
          >
            Devise par défaut
          </label>
          <input
            id="loc-cur"
            className="input"
            value={data.localization.defaultCurrency}
            onChange={(e) =>
              setData({
                ...data,
                localization: {
                  ...data.localization,
                  defaultCurrency: e.target.value,
                },
              })
            }
          />
        </div>

        <div>
          <label
            htmlFor="loc-datefmt"
            className="block text-sm font-medium text-gray-700"
          >
            Format de date
          </label>
          <input
            id="loc-datefmt"
            className="input"
            value={data.localization.dateFormat}
            onChange={(e) =>
              setData({
                ...data,
                localization: {
                  ...data.localization,
                  dateFormat: e.target.value,
                },
              })
            }
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="loc-numfmt"
            className="block text-sm font-medium text-gray-700"
          >
            Format des nombres
          </label>
          <input
            id="loc-numfmt"
            className="input"
            value={data.localization.numberFormat}
            onChange={(e) =>
              setData({
                ...data,
                localization: {
                  ...data.localization,
                  numberFormat: e.target.value,
                },
              })
            }
          />
        </div>
      </div>
    </section>
  );
};

export default Localizations;
