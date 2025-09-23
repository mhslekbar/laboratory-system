// src/index.tsx

import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// i18n (استيراد واحد فقط)
import "./translations/i18n";

import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";

import { initDOMFromStorage, syncSettings } from "./setup/appSettingsSync";

// Avant le rendu (évite un flash light/dark et mauvaise direction)
initDOMFromStorage({ theme: "light", dir: "ltr", themeColor: "#4f46e5" });

// طبّق إعدادات الثيم/الاتجاه/اللغة على DOM + i18n قبل الـ render
syncSettings(store);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="min-h-screen grid place-items-center bg-surface dark:bg-[#111827] text-neutral">
            <div className="rounded-lg px-4 py-2 bg-white dark:bg-[#1f2937] border border-surface dark:border-gray-700 shadow">
              Chargement…
            </div>
          </div>
        }
        persistor={persistor}
      >
        {/* لو حتحمّل ملفات ترجمة بشكل lazy بالمستقبل، Suspense يضمن fallback */}
        <Suspense fallback={<div>Loading i18n…</div>}>
          <App />
        </Suspense>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// اختياري: قياس الأداء
reportWebVitals();
