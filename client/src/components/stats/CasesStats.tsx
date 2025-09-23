import React, { useMemo } from "react";
import {
  aggregateCasesByMonth,
  aggregateCasesByYear,
  kpisForRange,
  CaseItem,
  PeriodMode,
} from "./utils";
import ChartCard from "./ChartCard";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  FiClipboard,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiUserCheck,
} from "react-icons/fi";
import { STATUS_COLORS, Gradients, getFill } from "./theme";

type Props = {
  cases: CaseItem[];
  mode: PeriodMode;     // "monthly" | "yearly" | "range"
  dateFrom: string;     // YYYY-MM-DD
  dateTo: string;       // YYYY-MM-DD
};

const nf = new Intl.NumberFormat("fr-FR");

/** "2025-01" -> "janv. 2025", "2025" -> "2025" */
const formatPeriod = (p: string) => {
  if (/^\d{4}-\d{2}$/.test(p)) {
    const [y, m] = p.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
  }
  if (/^\d{4}$/.test(p)) return p;
  return p;
};

const EmptyBlock: React.FC<{ label?: string }> = ({ label = "Aucune donnée sur la période" }) => (
  <div className="h-64 grid place-items-center text-sm text-gray-500">{label}</div>
);

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

/** Renvoie une belle couleur à partir du dataKey */
const pickColor = (dataKey?: string) => {
  const k = (dataKey || "") as keyof typeof STATUS_COLORS;
  return STATUS_COLORS[k]?.main ?? STATUS_COLORS.muted;
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const rows = payload
    .filter((p: any) => p?.value != null)
    .map((p: any) => ({
      name: p.name,
      value: p.value,
      color: pickColor(p.dataKey),
    }));

  const total = rows.reduce((s: number, r: any) => s + (Number(r.value) || 0), 0);

  return (
    <div className="rounded-xl border bg-white p-3 shadow">
      <div className="text-xs text-gray-500 mb-1">{formatPeriod(label)}</div>
      <div className="space-y-1">
        {rows.map((r: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
              {r.name}
            </div>
            <div className="font-medium">{nf.format(r.value)}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t text-xs text-gray-600 flex items-center justify-between">
        <span>Total</span>
        <span className="font-semibold">{nf.format(total)}</span>
      </div>
    </div>
  );
};

const CasesStats: React.FC<Props> = ({ cases, mode, dateFrom, dateTo }) => {
  const series = useMemo(
    () => (mode === "yearly" ? aggregateCasesByYear(cases, dateFrom, dateTo) : aggregateCasesByMonth(cases, dateFrom, dateTo)),
    [cases, dateFrom, dateTo, mode]
  );

  const kpi = useMemo(() => kpisForRange(cases, dateFrom, dateTo), [cases, dateFrom, dateTo]);

  const hasAny = (series?.length ?? 0) > 0 && (kpi.total ?? 0) > 0;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KPI icon={<FiClipboard />}   label="Total"     value={kpi.total} />
        <KPI icon={<FiClock />}       label="En attente" value={kpi.pending}   accent={STATUS_COLORS.pending.main} />
        <KPI icon={<FiTruck />}       label="Prêts"      value={kpi.ready}     accent={STATUS_COLORS.ready.main} />
        <KPI icon={<FiCheckCircle />} label="Livrés"     value={kpi.completed} accent={STATUS_COLORS.completed.main} />
        <KPI icon={<FiUserCheck />}   label="Reçus"      value={kpi.received}  accent={STATUS_COLORS.received.main} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="Par période" subtitle={mode === "yearly" ? "Regroupé par année" : "Regroupé par mois"}>
          {!hasAny ? (
            <EmptyBlock />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series}>
                  <Gradients idPrefix="cases" />
                  <CartesianGrid stroke={STATUS_COLORS.grid} />
                  <XAxis dataKey="period" tickFormatter={formatPeriod} tick={{ fontSize: 12 }} interval="preserveEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="pending"   stackId="status" name="En attente" fill={getFill("cases","pending")} />
                  <Bar dataKey="ready"     stackId="status" name="Prêts"      fill={getFill("cases","ready")} />
                  <Bar dataKey="completed" stackId="status" name="Livrés"     fill={getFill("cases","completed")} />
                  <Bar dataKey="received"                  name="Reçus"      fill={getFill("cases","received")} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Reçus (par période)" subtitle="Nombre de cas reçus">
          {!hasAny ? (
            <EmptyBlock />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid stroke={STATUS_COLORS.grid} vertical={false} />
                  <XAxis dataKey="period" tickFormatter={formatPeriod} tick={{ fontSize: 12 }} interval="preserveEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="received"
                    name="Reçus"
                    stroke={STATUS_COLORS.received.main}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Répartition sur la période" subtitle="Diagramme rond (statuts & reçus)">
        {!hasAny ? (
          <EmptyBlock />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(v: any) => nf.format(v as number)} labelFormatter={() => "Répartition"} />
                <Pie
                  data={[
                    { name: "En attente", value: kpi.pending },
                    { name: "Prêts",      value: kpi.ready },
                    { name: "Livrés",     value: kpi.completed },
                    { name: "Reçus",      value: kpi.received },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  labelLine={false}
                  label={(d: any) => {
                    const tot = (kpi.pending + kpi.ready + kpi.completed + kpi.received) || 1;
                    const pct = Math.round((d.value * 100) / tot);
                    return pct >= 6 ? `${pct}%` : "";
                  }}
                >
                  <Cell fill={STATUS_COLORS.pending.main} />
                  <Cell fill={STATUS_COLORS.ready.main} />
                  <Cell fill={STATUS_COLORS.completed.main} />
                  <Cell fill={STATUS_COLORS.received.main} />
                </Pie>
                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
};

export default CasesStats;
