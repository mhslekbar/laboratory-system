import React, { useMemo } from "react";
import { CaseItem, UserLike, topDoctors } from "./utils";
import ChartCard from "./ChartCard";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import {
  FiUsers,
  FiAward,
  FiCalendar,
  FiUserCheck,
  FiClock
} from "react-icons/fi";
import { STATUS_COLORS, Gradients, getFill } from "./theme";

const nf = new Intl.NumberFormat("fr-FR");

type Props = {
  cases: CaseItem[];
  users: UserLike[];
  dateFrom?: string;
  dateTo?: string;
  debug?: boolean;
};

const KPI: React.FC<{ icon: React.ReactNode; label: string; value: number | string; accent?: string; }> =
({ icon, label, value, accent }) => (
  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="mt-1 text-2xl font-semibold" style={accent ? { color: accent } : undefined}>
          {typeof value === "number" ? nf.format(value) : value}
        </div>
      </div>
      <div className="h-10 w-10 rounded-xl bg-gray-50 grid place-items-center text-gray-600">
        {icon}
      </div>
    </div>
  </div>
);

const EmptyBlock: React.FC<{ label?: string }> = ({ label = "Aucune donnée sur la période" }) => (
  <div className="h-72 grid place-items-center text-sm text-gray-500">{label}</div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const rec = payload.find((p: any) => p.dataKey === "received")?.value ?? 0;
  const pen = payload.find((p: any) => p.dataKey === "pending")?.value ?? 0;
  const total = (Number(rec) || 0) + (Number(pen) || 0);

  return (
    <div className="rounded-xl border bg-white p-3 shadow">
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS.received.main }} />
            Reçus
          </div>
          <div className="font-medium">{nf.format(rec)}</div>
        </div>
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS.pending.main }} />
            En attente
          </div>
          <div className="font-medium">{nf.format(pen)}</div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t text-xs text-gray-600 flex items-center justify-between">
        <span>Total</span>
        <span className="font-semibold">{nf.format(total)}</span>
      </div>
    </div>
  );
};

function normalizeTopDoctor(raw: any) {
  const name = raw?.name ?? raw?.label ?? raw?.fullName ?? raw?.username ?? "—";
  const received = raw?.received ?? raw?.reçus ?? raw?.recus ?? raw?.receivedCount ?? raw?.received_cases ?? 0;
  const pending  = raw?.pending  ?? raw?.attente ?? raw?.pendingCount  ?? raw?.waiting        ?? 0;
  const total    = raw?.total    ?? (Number(received) || 0) + (Number(pending) || 0);

  return {
    name,
    received: Number(received) || 0,
    pending:  Number(pending)  || 0,
    total:    Number(total)    || 0,
  };
}

const DoctorsStats: React.FC<Props> = ({ cases, users, dateFrom, dateTo, debug = false }) => {
  const doctorsCount = useMemo(
    () => (Array.isArray(users) ? users.filter((u: any) => u?.doctor?.isDoctor).length : 0),
    [users]
  );

  const top = useMemo(() => {
    const raw = (topDoctors?.(cases, users, 10, dateFrom, dateTo) as any[]) ?? [];
    const norm = raw.map(normalizeTopDoctor);
    if (debug) console.debug("[DoctorsStats]", { cases: cases?.length, users: users?.length, raw, norm });
    return norm;
  }, [cases, users, dateFrom, dateTo, debug]);

  const data = top;
  const hasAny = data.length > 0;

  // -- helpers pour l'entête --
  const fmtDate = (s?: string) => {
    if (!s) return "—";
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  };
  const periodLabel = `${fmtDate(dateFrom)} → ${fmtDate(dateTo)}`;

  return (
    <div className="space-y-4">
      {/* Header — Statistiques Médecins */}
      <header className="relative overflow-hidden rounded-2xl border bg-white/80 dark:bg-slate-900/40 backdrop-blur p-5 shadow-sm">
        {/* Décor subtil */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-500/10 dark:to-emerald-300/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-200 dark:from-indigo-500/10 dark:to-indigo-300/10 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          {/* Titre + sous-titre */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl grid place-items-center bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <FiUsers className="text-xl" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-gray-500">Statistiques</div>
              <h2 className="text-xl sm:text-2xl font-semibold leading-tight">Médecins</h2>
              <p className="mt-1 text-xs text-gray-500">Période&nbsp;: {periodLabel}</p>
            </div>
          </div>

          {/* Badges rapides */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200">
              Total médecins&nbsp;: {nf.format(doctorsCount)}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              Top affiché&nbsp;: {nf.format(Math.min(10, data.length))}
            </span>
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPI icon={<FiUsers />}     label="Médecins"             value={doctorsCount} />
        <KPI icon={<FiAward />}     label="Top (affichés)"       value={data.length} />
        <KPI icon={<FiUserCheck />} label="Reçus (Top 10)"       value={data.reduce((s, r) => s + (r.received || 0), 0)} accent={STATUS_COLORS.received.main} />
        <KPI icon={<FiClock />}     label="En attente (Top 10)"  value={data.reduce((s, r) => s + (r.pending  || 0), 0)} accent={STATUS_COLORS.pending.main} />
      </div>

      {/* Chart vertical bars */}
      <ChartCard title="Top 10 — cas reçus & en attente" subtitle="Classement des médecins sur la période sélectionnée">
        {!hasAny ? (
          <EmptyBlock />
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 12, right: 16, top: 8, bottom: 8 }}>
                <Gradients idPrefix="doctors" />
                <CartesianGrid stroke={STATUS_COLORS.grid} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={140} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="received" name="Reçus"      fill={getFill("doctors","received")} />
                <Bar dataKey="pending"  name="En attente" fill={getFill("doctors","pending")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      {/* Tableau Top 10 */}
      <ChartCard title="Tableau (Top 10)" subtitle={periodLabel}>
        {!hasAny ? (
          <EmptyBlock label="Aucun médecin sur la période" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="px-3 py-2 w-12">#</th>
                  <th className="px-3 py-2">Médecin</th>
                  <th className="px-3 py-2 text-right">Reçus</th>
                  <th className="px-3 py-2 text-right">En attente</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((r, i) => {
                  const badge = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1;
                  return (
                    <tr key={i} className="bg-white hover:bg-gray-50">
                      <td className="px-3 py-2 text-center">{badge}</td>
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2 text-right" style={{ color: STATUS_COLORS.received.main }}>{nf.format(r.received)}</td>
                      <td className="px-3 py-2 text-right" style={{ color: STATUS_COLORS.pending.main }}>{nf.format(r.pending)}</td>
                      <td className="px-3 py-2 text-right font-medium">{nf.format(r.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td className="px-3 py-2 text-right font-medium" colSpan={2}>Totaux Top 10</td>
                  <td className="px-3 py-2 text-right font-medium" style={{ color: STATUS_COLORS.received.main }}>
                    {nf.format(data.reduce((s, r) => s + (r.received || 0), 0))}
                  </td>
                  <td className="px-3 py-2 text-right font-medium" style={{ color: STATUS_COLORS.pending.main }}>
                    {nf.format(data.reduce((s, r) => s + (r.pending  || 0), 0))}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {nf.format(data.reduce((s, r) => s + (r.total    || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </ChartCard>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <FiCalendar />
        <span>Période : {periodLabel}</span>
      </div>
    </div>
  );
};

export default DoctorsStats;
