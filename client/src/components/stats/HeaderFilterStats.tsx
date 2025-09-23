import React from "react";
import ChartCard from "./ChartCard";
import { PeriodMode, toYMD } from "./utils";
import { FiFilter, FiCalendar, FiUsers, FiUser, FiLayers } from "react-icons/fi";

type Props = {
  mode: PeriodMode;
  setMode: (m: PeriodMode) => void;
  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
  totalCases: number;
  doctorsCount: number;
  patientsCount: number;
};

const ACCENTS: Record<string, { bg: string; text: string; ring: string }> = {
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-600",  ring: "ring-indigo-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-600",  ring: "ring-violet-100" },
};

const HeaderFilterStats: React.FC<Props> = ({
  mode,
  setMode,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  totalCases,
  doctorsCount,
  patientsCount,
}) => {
  const applyPreset = (preset: "today" | "7d" | "30d" | "ytd") => {
    const now = new Date();
    const end = toYMD(now);

    if (preset === "today") {
      const start = toYMD(now);
      setDateFrom(start);
      setDateTo(end);
      return;
    }
    if (preset === "7d") {
      const s = new Date(now); s.setDate(s.getDate() - 6);
      setDateFrom(toYMD(s)); setDateTo(end); return;
    }
    if (preset === "30d") {
      const s = new Date(now); s.setDate(s.getDate() - 29);
      setDateFrom(toYMD(s)); setDateTo(end); return;
    }
    const yStart = new Date(now.getFullYear(), 0, 1); // YTD
    setDateFrom(toYMD(yStart)); setDateTo(end);
  };

  const ModePill: React.FC<{ value: PeriodMode; label: string }> = ({ value, label }) => (
    <button
      type="button"
      aria-pressed={mode === value}
      onClick={() => setMode(value)}
      className={`px-3 py-1.5 text-sm rounded-lg transition ${
        mode === value ? "bg-indigo-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; accent?: keyof typeof ACCENTS; }> =
  ({ icon, label, value, accent = "indigo" }) => {
    const c = ACCENTS[accent] || ACCENTS.indigo;
    return (
      <div className="rounded-2xl border bg-white p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl grid place-items-center ${c.bg} ${c.text} ring-1 ${c.ring}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-2xl font-semibold leading-6 truncate">{value}</div>
        </div>
      </div>
    );
  };

  return (
    <ChartCard
      title="Tableau de bord — Statistiques"
      subtitle={
        <span className="inline-flex items-center gap-2">
          <FiFilter className="text-gray-500" />
          Visualisez les performances par période
        </span>
      }
      right={
        <div className="flex flex-col gap-2 items-stretch">
          <div className="inline-flex rounded-xl border border-gray-300 bg-white p-1 shadow-sm self-end">
            <ModePill value="monthly" label="Mensuel" />
            <ModePill value="yearly"  label="Annuel" />
            <ModePill value="range"   label="Plage" />
          </div>

          <div className="flex flex-wrap items-end gap-2 justify-end">
            <div className="flex items-center gap-2">
              <label className="text-sm">De</label>
              <div className="relative">
                <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" value={dateFrom || ""} onChange={(e) => setDateFrom(e.target.value)} className="h-10 rounded-xl border pl-9 pr-3" />
              </div>
              <label className="text-sm">à</label>
              <div className="relative">
                <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" value={dateTo || ""} onChange={(e) => setDateTo(e.target.value)} className="h-10 rounded-xl border pl-9 pr-3" />
              </div>
            </div>

            <div className="inline-flex rounded-xl border border-gray-300 bg-white p-1 shadow-sm">
              <button type="button" onClick={() => applyPreset("today")} className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100" title="Aujourd'hui">Aujourd’hui</button>
              <button type="button" onClick={() => applyPreset("7d")}    className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100" title="7 derniers jours">7 j</button>
              <button type="button" onClick={() => applyPreset("30d")}   className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100" title="30 derniers jours">30 j</button>
              <button type="button" onClick={() => applyPreset("ytd")}   className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100" title="Depuis le 1er janvier">YTD</button>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard icon={<FiLayers />} label="Dossiers" value={totalCases}  accent="indigo" />
        <KpiCard icon={<FiUsers  />} label="Médecins" value={doctorsCount} accent="emerald" />
        <KpiCard icon={<FiUser   />} label="Patients" value={patientsCount} accent="violet" />
      </div>
    </ChartCard>
  );
};

export default HeaderFilterStats;
