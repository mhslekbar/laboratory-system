import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import type { State } from "../../redux/store";
import ChartCard from "../stats/ChartCard";
import { startOfDay, endOfDay } from "../stats/utils";
import TodosWidget from "../todos/TodosWidget";
import { FiCalendar, FiClock, FiTrendingUp, FiPackage, FiCheckCircle } from "react-icons/fi";

const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const isBetween = (d?: string | Date, from?: Date, to?: Date) => {
  if (!d) return false;
  const x = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return false;
  return (!from || x >= from) && (!to || x <= to);
};

const KpiTile: React.FC<{ icon: React.ReactNode; label: string; value: number | string; accent?: string }> = ({
  icon, label, value, accent = "indigo"
}) => (
  <div className="rounded-2xl border p-4 bg-white flex items-center gap-3">
    <div className={`h-10 w-10 rounded-xl grid place-items-center bg-${accent}-50 text-${accent}-600 ring-1 ring-${accent}-100`}>
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold leading-6 truncate">{value}</div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const cases = useSelector((s: State) => (s as any).cases?.items || []);

  const todayEnd = endOfDay(new Date());

  const kpis = useMemo(() => {
    const last7dStart = startOfDay(daysAgo(6));
    const created7d = cases.filter((c: any) => isBetween(c.createdAt, last7dStart, todayEnd)).length;
    const created24h = cases.filter((c: any) => isBetween(c.createdAt, startOfDay(daysAgo(0)), todayEnd)).length;

    const pending = cases.filter((c: any) => (c?.delivery?.status ?? "pending") === "pending").length;
    const readyToday = cases.filter((c: any) => (c?.delivery?.status ?? "pending") === "ready").length;
    const received7d = cases.filter((c: any) => c?.caseApproval?.approved && isBetween(c.createdAt, last7dStart, todayEnd)).length;

    return { created24h, created7d, pending, readyToday, received7d };
  }, [cases, todayEnd]);

  const oldestPending = useMemo(() => {
    return cases
      .filter((c: any) => (c?.delivery?.status ?? "pending") === "pending")
      .sort((a: any, b: any) => new Date(a.createdAt as any).getTime() - new Date(b.createdAt as any).getTime())
      .slice(0, 5);
  }, [cases]);

  const readyList = useMemo(() => {
    return cases
      .filter((c: any) => (c?.delivery?.status ?? "pending") === "ready")
      .sort((a: any, b: any) => new Date(a.createdAt as any).getTime() - new Date(b.createdAt as any).getTime())
      .slice(0, 5);
  }, [cases]);

  const receivedRecent = useMemo(() => {
    return cases
      .filter((c: any) => c?.caseApproval?.approved)
      .sort((a: any, b: any) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime())
      .slice(0, 5);
  }, [cases]);

  return (
    <div className="p-5 space-y-5">
      {/* Résumé rapide */}
      <ChartCard
        title="Résumé rapide"
        subtitle="Aperçu des flux récents"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiTile icon={<FiTrendingUp />} label="Aujourd’hui (créés)" value={kpis.created24h} accent="indigo" />
          <KpiTile icon={<FiCalendar />} label="7 derniers jours" value={kpis.created7d} accent="violet" />
          <KpiTile icon={<FiClock />} label="En attente" value={kpis.pending} accent="amber" />
          <KpiTile icon={<FiPackage />} label="Prêts à livrer" value={kpis.readyToday} accent="sky" />
          <KpiTile icon={<FiCheckCircle />} label="Reçus (7j)" value={kpis.received7d} accent="emerald" />
        </div>
      </ChartCard>

      {/* Files d’attente */}
      <div className="grid lg:grid-cols-3 gap-4">
        <ChartCard title="À traiter en priorité" subtitle="Les plus anciens en attente">
          <ul className="space-y-2">
            {oldestPending.map((c: any, index: number) => (
              <li key={index} className="flex items-center justify-between rounded-xl border p-3 bg-white hover:bg-gray-50 transition">
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.code ?? c._id}</div>
                  <div className="text-xs text-gray-500 truncate">{c?.patient?.name || c?.patient || "—"}</div>
                </div>
                <button className="h-8 px-3 rounded-lg border text-xs hover:bg-gray-50">Ouvrir</button>
              </li>
            ))}
            {!oldestPending.length && <div className="text-sm text-gray-500">Rien à afficher</div>}
          </ul>
        </ChartCard>

        <ChartCard title="Prêts à livrer" subtitle="Prochains">
          <ul className="space-y-2">
            {readyList.map((c: any, index: number) => (
              <li key={index} className="flex items-center justify-between rounded-xl border p-3 bg-white hover:bg-gray-50 transition">
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.code ?? c._id}</div>
                  <div className="text-xs text-gray-500 truncate">{c?.doctor?.fullName || c?.doctor || "—"}</div>
                </div>
                <button className="h-8 px-3 rounded-lg border text-xs hover:bg-gray-50">Marquer livré</button>
              </li>
            ))}
            {!readyList.length && <div className="text-sm text-gray-500">Rien à afficher</div>}
          </ul>
        </ChartCard>

        <ChartCard title="Reçus récemment" subtitle="Dernières confirmations">
          <ul className="space-y-2">
            {receivedRecent.map((c: any, index: number) => (
              <li key={index} className="flex items-center justify-between rounded-xl border p-3 bg-white hover:bg-gray-50 transition">
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.code ?? c._id}</div>
                  <div className="text-xs text-gray-500 truncate">{c?.patient?.name || c?.patient || "—"}</div>
                </div>
                <button className="h-8 px-3 rounded-lg border text-xs hover:bg-gray-50">Voir</button>
              </li>
            ))}
            {!receivedRecent.length && <div className="text-sm text-gray-500">Rien à afficher</div>}
          </ul>
        </ChartCard>
      </div>

      {/* Todos */}
      <TodosWidget />
    </div>
  );
};

export default Dashboard;
