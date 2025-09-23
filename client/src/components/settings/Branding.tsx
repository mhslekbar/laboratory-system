import React from 'react'

const Branding = ({ data , setData}: any) => {

  return (
    <section className="rounded-2xl border bg-white shadow-sm p-6 space-y-4">
      {/* Branding */}
        <h2 className="font-semibold">Branding</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand-color" className="block text-sm font-medium text-gray-700">
              Couleur primaire (#hex)
            </label>
            <input
              id="brand-color"
              className="input"
              value={data.branding.theme.primaryColor}
              onChange={(e) =>
                setData({
                  ...data,
                  branding: {
                    ...data.branding,
                    theme: { ...data.branding.theme, primaryColor: e.target.value },
                  },
                })
              }
              placeholder="#4f46e5"
            />
          </div>

          <div>
            <label htmlFor="brand-mode" className="block text-sm font-medium text-gray-700">Mode</label>
            <select
              id="brand-mode"
              className="input"
              value={data.branding.theme.mode}
              onChange={(e) =>
                setData({
                  ...data,
                  branding: {
                    ...data.branding,
                    theme: { ...data.branding.theme, mode: e.target.value },
                  },
                })
              }
            >
              <option value="system">Système</option>
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="brand-header" className="block text-sm font-medium text-gray-700">Print Header HTML</label>
            <textarea
              id="brand-header"
              className="input"
              value={data.branding.printHeaderHTML}
              onChange={(e) =>
                setData({
                  ...data,
                  branding: { ...data.branding, printHeaderHTML: e.target.value },
                })
              }
              rows={4}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="brand-footer" className="block text-sm font-medium text-gray-700">Print Footer HTML</label>
            <textarea
              id="brand-footer"
              className="input"
              value={data.branding.printFooterHTML}
              onChange={(e) =>
                setData({
                  ...data,
                  branding: { ...data.branding, printFooterHTML: e.target.value },
                })
              }
              rows={4}
            />
          </div>
        </div>
      </section>
  )
}

export default Branding