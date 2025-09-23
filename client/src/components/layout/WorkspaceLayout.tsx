import React from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";

export type ModuleDef = {
  path: string;
  label: string;
  element: React.ReactNode;
  icon?: React.ReactNode;
  index?: boolean;
};

type Props = {
  title: string;       // ex: "DR. Mohamed Salem"
  basePath: string;    // ex: "/doctor"
  modules: ModuleDef[];
  onLogout?: () => void;
  subtitle?: string;   // ex: "Espace médecin"
};

function initials(from: string) {
  const s = String(from || "").replace(/^DR\.\s*/i, "").trim();
  const parts = s.split(/\s+/);
  const a = (parts[0]?.[0] || "").toUpperCase();
  const b = (parts[1]?.[0] || "").toUpperCase();
  return (a + b || a || "D").slice(0, 2);
}

export default function WorkspaceLayout({
  title,
  basePath,
  modules,
  onLogout,
  subtitle = "Espace médecin",
}: Props) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const indexModule = modules.find((m) => m.index) || modules[0];

  // Fermer le menu mobile à chaque navigation
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const SidebarContent = (
    <>
      {/* Header doctor */}
      <div className="px-4 py-5 border-b border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-indigo-50 to-white dark:from-[#0f172a] dark:to-[#111827]">
        <Link to={basePath} className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow">
            {initials(title)}
          </div>
          <div className="min-w-0">
            <div className="text-base font-bold truncate">{title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
        {modules.map((m) => (
          <NavLink
            key={m.path || "index"}
            to={m.path ? `${m.path}` : ""}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition
               ${
                 isActive
                   ? "bg-indigo-600 text-white shadow-sm"
                   : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900"
               }`
            }
          >
            {m.icon ? <span className="text-base">{m.icon}</span> : null}
            <span className="truncate">{m.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      {onLogout && (
        <div className="p-3 border-t border-gray-200 dark:border-zinc-800">
          <button
            onClick={onLogout}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-900 text-sm"
          >
            <FiLogOut /> <span>Déconnexion</span>
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0b0c]">
      {/* Skip link */}
      <a
        href="#workspace-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 bg-indigo-600 text-white px-3 py-1 rounded"
      >
        Aller au contenu
      </a>

      {/* Top bar (mobile) */}
      <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-zinc-800">
        <div className="h-14 px-3 flex items-center justify-between">
          <button
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900"
          >
            <FiMenu className="text-xl" />
          </button>
          <div className="min-w-0 text-center">
            <div className="text-sm font-semibold truncate">{title}</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{subtitle}</div>
          </div>
          {onLogout ? (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900"
              aria-label="Déconnexion"
              title="Déconnexion"
            >
              <FiLogOut className="text-xl" />
            </button>
          ) : (
            <span className="w-9" />
          )}
        </div>
      </header>

      {/* Desktop layout */}
      <div className="md:pl-72">
        {/* Sidebar desktop */}
        <aside
          className="hidden md:flex fixed inset-y-0 left-0 w-72 z-30 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] flex-col"
          aria-label="Navigation latérale"
        >
          {SidebarContent}
        </aside>

        {/* Sidebar mobile (drawer) */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* overlay */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            {/* drawer */}
            <div
              role="dialog"
              aria-modal="true"
              className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-zinc-800 shadow-xl transform transition-transform duration-200"
            >
              <div className="h-14 px-3 flex items-center justify-between border-b border-gray-200 dark:border-zinc-800">
                <span className="font-semibold">Menu</span>
                <button
                  aria-label="Fermer le menu"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="flex flex-col h-[calc(100%-56px)]">{SidebarContent}</div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main id="workspace-main" className="p-4 md:p-6">
          <Routes>
            <Route index element={<>{indexModule.element}</>} />
            {modules
              .filter((m) => !!m.path)
              .map((m) => (
                <Route key={m.path} path={m.path} element={<>{m.element}</>} />
              ))}
            <Route path="*" element={<div>Page introuvable</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
