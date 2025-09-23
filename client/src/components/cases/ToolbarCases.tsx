// src/components/cases/ToolbarCases.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiSearch,
  FiX,
  FiRefreshCw,
  FiPlus,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiInfo,
} from "react-icons/fi";
import SearchSelect, { Option } from "../common/SearchSelect";

export type DeliveryView =
  | "all"
  | "pending"
  | "scheduled"
  | "delivered"
  | "received";

type Props = {
  q: string;
  setQ: (v: string) => void;

  total: number;
  page: number;
  pages: number;
  hasPrev: boolean;
  hasNext: boolean;
  goPrev: () => void;
  goNext: () => void;

  limit: number;
  onChangeLimit: (n: number) => void;

  delivery: DeliveryView;
  onChangeDelivery: (v: DeliveryView) => void;

  onAddCase?: () => void;
  onRefresh?: () => void;

  // Dates (YYYY-MM-DD)
  dateFrom?: string;
  dateTo?: string;
  onChangeDateFrom?: (v: string) => void;
  onChangeDateTo?: (v: string) => void;

  // Filtres avancés
  patientValue?: Option | null;
  onPatientChange?: (opt: Option | null) => void;
  fetchPatients?: (q: string) => Promise<Option[]>;
  doctorValue?: Option | null;
  onDoctorChange?: (opt: Option | null) => void;
  fetchDoctors?: (q: string) => Promise<Option[]>;
  patientDisabled?: boolean;

  // UI info
  clientFiltered?: boolean;
  visibleCount?: number;
};

const ToolbarCases: React.FC<Props> = ({
  q,
  setQ,
  total,
  page,
  pages,
  hasPrev,
  hasNext,
  goPrev,
  goNext,
  limit,
  onChangeLimit,
  delivery,
  onChangeDelivery,
  onAddCase,
  onRefresh,
  dateFrom,
  dateTo,
  onChangeDateFrom,
  onChangeDateTo,
  patientValue,
  onPatientChange,
  fetchPatients,
  doctorValue,
  onDoctorChange,
  fetchDoctors,
  patientDisabled,
  clientFiltered,
  visibleCount,
}) => {
  const { t } = useTranslation();
  const datesEnabled = delivery === "all";

  useEffect(() => {
    if (!datesEnabled) {
      onChangeDateFrom?.("");
      onChangeDateTo?.("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datesEnabled]);

  const [input, setInput] = useState(q ?? "");
  useEffect(() => setInput(q ?? ""), [q]);
  useEffect(() => {
    const id = setTimeout(() => {
      if (input !== q) setQ(input);
    }, 350);
    return () => clearTimeout(id);
  }, [input]); // eslint-disable-line

  const submitNow = () => setQ(input);
  const clearSearch = () => {
    setInput("");
    setQ("");
  };

  const effectiveDateFrom = datesEnabled ? dateFrom : "";
  const effectiveDateTo = datesEnabled ? dateTo : "";
  const datesEmptyAndEnabled =
    datesEnabled && !effectiveDateFrom && !effectiveDateTo;

  const isClientFiltered =
    typeof clientFiltered === "boolean"
      ? clientFiltered
      : !!effectiveDateFrom || !!effectiveDateTo || delivery === "received";

  const pageInfo = useMemo(() => {
    if (isClientFiltered) {
      const shown = typeof visibleCount === "number" ? visibleCount : 0;
      if ((total || 0) === 0) return t("Aucun résultat");
      if (shown === 0) return t("Aucun résultat (après filtre)");
      return `${t("Affichés")} ${shown} ${t("(après filtre)")} • ${t(
        "Page"
      )} ${page}/${pages} — ${total} ${t("total")}`;
    }
    if (total === 0) return t("Aucun résultat");
    const start = Math.min(total, (page - 1) * (limit || 10) + 1);
    const end = Math.min(total, page * (limit || 10));
    return `${t("Page")} ${page ?? 1} / ${pages ?? 1} — ${total} ${t(
      "total"
    )} • ${start}-${end}`;
  }, [isClientFiltered, visibleCount, page, pages, total, limit, t]);

  const statusTabs: { key: DeliveryView; label: string }[] = [
    { key: "all", label: t("Tous") },
    { key: "pending", label: t("En attente") },
    { key: "scheduled", label: t("Prêts") },
    { key: "delivered", label: t("Livrés") },
    { key: "received", label: t("Reçus") },
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 p-[1px]">
      <div className="rounded-3xl bg-white dark:bg-[#111827]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <FiFilter /> {t("Gestion des dossiers")}
            </div>
            <h2 className="mt-1 text-lg md:text-xl font-semibold tracking-tight">
              {delivery === "all"
                ? t("Dossiers")
                : delivery === "pending"
                ? t("Dossiers (en attente)")
                : delivery === "scheduled"
                ? t("Dossiers (prêts)")
                : delivery === "delivered"
                ? t("Dossiers (livrés)")
                : t("Dossiers (reçus)")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("Recherchez, filtrez et paginez la liste.")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="h-10 px-3 rounded-xl border border-gray-300 dark:border-zinc-700 text-sm hover:bg-gray-50 dark:hover:bg-zinc-900 flex items-center gap-2"
                title={t("Rafraîchir") as string}
              >
                <FiRefreshCw />
                <span className="hidden sm:inline">{t("Rafraîchir")}</span>
              </button>
            )}
            {onAddCase && (
              <button
                type="button"
                onClick={onAddCase}
                className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 flex items-center gap-2"
              >
                <FiPlus />
                {t("Ajouter dossier")}
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 sm:px-6 py-4 space-y-4">
          {/* Row 1: Search + Status */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,26rem)_1fr] gap-3">
            {/* Search */}
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">
                {t("Recherche")}
              </label>
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitNow()}
                  placeholder={t("Code, patient, médecin…") as string}
                  className="h-10 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#0b0b0c] pl-9 pr-9 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {input?.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label={t("Effacer la recherche") as string}
                    title={t("Effacer la recherche") as string}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>

            {/* Status pills */}
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">{t("Statut")}</label>
              <div className="w-full overflow-x-auto">
                <div className="inline-flex rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#0b0b0c] p-1 shadow-sm">
                  {statusTabs.map((tab, index) => (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={delivery === tab.key}
                      onClick={() => {
                        onChangeDelivery(tab.key);
                        if (tab.key !== "all") {
                          onChangeDateFrom?.("");
                          onChangeDateTo?.("");
                        }
                      }}
                      className={`px-3 py-1.5 text-sm rounded-lg transition whitespace-nowrap ${
                        delivery === tab.key
                          ? "bg-indigo-600 text-white shadow"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 1.5: Filtres avancés — Docteur / Patient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SearchSelect
              label="Docteur"
              value={doctorValue || null}
              onChange={(opt) => onDoctorChange?.(opt)}
              fetchOptions={async (text) =>
                fetchDoctors ? fetchDoctors(text) : []
              }
              placeholder="Nom d’utilisateur, nom…"
              clearable
              disabled={false}
            />
            <SearchSelect
              label="Patient"
              value={patientValue || null}
              onChange={(opt) => onPatientChange?.(opt)}
              fetchOptions={async (text) =>
                fetchPatients ? fetchPatients(text) : []
              }
              placeholder={
                patientDisabled
                  ? "Sélectionnez d’abord un docteur"
                  : "Nom, téléphone…"
              }
              clearable
              disabled={!!patientDisabled}
            />
          </div>

          {/* Row 2: Dates + Limit + Pager */}
          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,36rem)_auto_1fr] gap-4 items-end">
            {/* Dates group */}
            <fieldset
              className={`rounded-2xl border p-3 md:p-4 bg-white dark:bg-[#111827] border-gray-200 dark:border-zinc-800 ${
                !datesEnabled ? "opacity-60" : ""
              }`}
              aria-disabled={!datesEnabled}
              title={
                !datesEnabled
                  ? (t("Désactivé quand un statut est sélectionné") as string)
                  : undefined
              }
            >
              <legend className="px-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                {t("Période (optionnel)")}
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">{t("Du")}</label>
                  <div className="relative">
                    <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={effectiveDateFrom || ""}
                      disabled={!datesEnabled}
                      onChange={(e) => onChangeDateFrom?.(e.target.value)}
                      className="h-10 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#0b0b0c] pl-9 pr-3"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">{t("Au")}</label>
                  <div className="relative">
                    <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={effectiveDateTo || ""}
                      disabled={!datesEnabled}
                      onChange={(e) => onChangeDateTo?.(e.target.value)}
                      className="h-10 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#0b0b0c] pl-9 pr-3"
                    />
                  </div>
                </div>

                {datesEmptyAndEnabled && (
                  <div className="md:col-span-2 flex items-start gap-2 text-[11px] text-gray-600 dark:text-gray-400 mt-1">
                    <FiInfo className="mt-[2px]" />
                    <span>
                      {t(
                        "Aucune plage de dates — affichage de tous les dossiers"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </fieldset>

            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">{t("Lignes")}</label>
              <select
                className="h-10 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#0b0b0c] px-3"
                value={limit}
                onChange={(e) => onChangeLimit(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-stretch 2xl:items-end gap-2">
              <div className="flex items-center gap-2 justify-between 2xl:justify-end">
                <button
                  type="button"
                  disabled={!hasPrev}
                  onClick={goPrev}
                  className="h-10 px-3 rounded-xl border border-gray-300 dark:border-zinc-700 text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-zinc-900 flex items-center gap-2"
                >
                  <FiChevronLeft />
                  {t("Précédent")}
                </button>
                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={goNext}
                  className="h-10 px-3 rounded-xl border border-gray-300 dark:border-zinc-700 text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-zinc-900 flex items-center gap-2"
                >
                  {t("Suivant")}
                  <FiChevronRight />
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {pageInfo}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolbarCases;
