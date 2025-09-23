import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiSearch, FiX } from "react-icons/fi";

interface ToolbarUsersProps {
  q: string;
  setQ: (v: string) => void;

  total: number;
  page: number;
  pages: number;
  hasPrev: boolean;
  hasNext: boolean;

  goPrev: () => void;
  goNext: () => void;

  limit?: number;
  onChangeLimit?: (n: number) => void;

  view: "all" | "users" | "doctors";
  onChangeView: (v: "all" | "users" | "doctors") => void;

  onAddUser?: () => void;
  onRefresh?: () => void;
}

const ToolbarUsers: React.FC<ToolbarUsersProps> = ({
  q, setQ, total,
  page, pages, hasPrev, hasNext,
  goPrev, goNext,
  limit = 10, onChangeLimit,
  view, onChangeView,
  onAddUser, onRefresh,
}) => {
  const { t } = useTranslation();

  // debounce comme PatientsToolbar
  const [input, setInput] = useState<string>(q ?? "");
  useEffect(() => setInput(q ?? ""), [q]);
  useEffect(() => {
    const id = setTimeout(() => {
      if (input !== q) setQ(input);
    }, 400);
    return () => clearTimeout(id);
  }, [input]); // eslint-disable-line

  const submitNow = () => setQ(input);
  const clearSearch = () => { setInput(""); setQ(""); };

  const pageInfo = useMemo(() => {
    const start = Math.min(total, (page - 1) * (limit || 10) + 1);
    const end = Math.min(total, page * (limit || 10));
    if (total === 0) return t("Aucun résultat");
    return `Page ${page ?? 1} / ${pages ?? 1} — ${total} total • ${start}-${end}`;
  }, [page, pages, total, limit, t]);

  const changeLimit = (n: number) => onChangeLimit?.(n);

  const title = useMemo(() => {
    if (view === "doctors") return t("Médecins");
    if (view === "users")   return t("Utilisateurs");
    return t("Tous les comptes");
  }, [view, t]);

  const addLabel = view === "doctors" ? t("Ajouter médecin") : t("Ajouter utilisateur");

  return (
    <>
      {/* Carte gradient (même style que PatientsToolbar) */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 p-[1px] mb-2">
        <div className="rounded-3xl bg-white p-4 sm:p-5">
          {/* Header: titre + bouton Ajouter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
              <p className="text-xs text-gray-500">{t("Recherchez, filtrez et paginez la liste.")}</p>
            </div>
            {onAddUser && (
              <button
                type="button"
                onClick={onAddUser}
                className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700"
              >
                {addLabel}
              </button>
            )}
          </div>

          {/* Filtres + actions (même grille que PatientsToolbar) */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,18rem)_auto_auto] gap-3 sm:items-end">
              {/* Recherche */}
              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1">{t("Recherche")}</label>
                <div className="relative">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitNow()}
                    placeholder={t("Rechercher par nom, username, téléphone, email") as string}
                    className="h-11 w-full rounded-xl border pl-9 pr-9 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {input?.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label={t("Effacer la recherche") as string}
                      title={t("Effacer la recherche") as string}
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>

              {/* Filtrer par type (segmented) */}
              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1">{t("Filtrer par type")}</label>
                <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 shadow-sm">
                  {(["all", "users", "doctors"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      role="tab"
                      aria-selected={view === v}
                      onClick={() => onChangeView(v)}
                      className={`px-3 py-1.5 text-sm rounded-md transition ${
                        view === v
                          ? "bg-indigo-600 text-white shadow"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {v === "all" ? t("Tous") : v === "users" ? t("Utilisateurs") : t("Médecins")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lignes */}
              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1">{t("Lignes")}</label>
                <select
                  className="h-11 rounded-xl border px-2"
                  value={limit}
                  onChange={(e) => changeLimit(Number(e.target.value))}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Rafraîchir */}
              <div className="flex sm:justify-end">
                <button
                  type="button"
                  onClick={onRefresh}
                  className="h-11 px-4 rounded-xl border text-sm hover:bg-gray-50 w-full sm:w-auto"
                >
                  {t("Rafraîchir")}
                </button>
              </div>
            </div>

            {/* Info de page */}
            <div className="text-xs text-gray-500 sm:text-right">
              {pageInfo}
            </div>

            {/* Pagination desktop/tablette (même rendu que Patients) */}
            <div className="hidden sm:flex items-center gap-2 justify-end">
              <button
                type="button"
                disabled={!hasPrev}
                onClick={goPrev}
                className="h-10 px-3 rounded-xl border text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                {t("Précédent")}
              </button>
              <button
                type="button"
                disabled={!hasNext}
                onClick={goNext}
                className="h-10 px-3 rounded-xl border text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                {t("Suivant")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination sticky mobile (identique à Patients) */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
      >
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
          <div className="text-[11px] text-gray-600">{pageInfo}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={goPrev}
              className="h-9 px-3 rounded-xl border text-xs disabled:opacity-50 hover:bg-gray-50"
            >
              {t("Précédent")}
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={goNext}
              className="h-9 px-3 rounded-xl border text-xs disabled:opacity-50 hover:bg-gray-50"
            >
              {t("Suivant")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolbarUsers;
