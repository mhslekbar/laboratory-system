import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../redux/store";
import { approveCaseApi, fetchDoctorCases } from "../../../redux/doctorCases/doctorCasesApi";
import { UserData } from "../../../requestMethods";
import { FiSearch, FiChevronLeft, FiChevronRight, FiRefreshCw, FiInfo } from "react-icons/fi";

type StatusFilter = "" | "pending" | "scheduled" | "delivered" | "received";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "",           label: "Tous" },
  { key: "pending",    label: "En attente" },
  { key: "scheduled",  label: "Prêt" },
  { key: "delivered",  label: "Livré" },
  { key: "received",   label: "Reçus" },
];

// jolie étiquette côté UI
function labelDelivery(s?: string) {
  if (s === "scheduled") return "Prêt";
  if (s === "delivered") return "Livré";
  return "En attente";
}

function badgeDeliveryCls(s?: string) {
  if (s === "scheduled")
    return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";
  if (s === "delivered")
    return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200";
  return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-zinc-800 dark:text-gray-200";
}

export default function DoctorCases() {
  const dispatch: any = useDispatch();
  const { data, loading, filters, error } = useSelector((s: State) => (s as any).doctorCases);

  const [q, setQ] = useState(filters.q || "");
  const [status, setStatus] = useState<StatusFilter>((filters.status as StatusFilter) || "");
  const [limit, setLimit] = useState<number>(filters.limit || 10);

  const doctorId = UserData()?._id;

  // 1) Chargement initial
  useEffect(() => {
    dispatch(fetchDoctorCases({ doctorId, page: 1, limit }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, doctorId]);

  // 2) Recherche (bouton & Enter)
  const onSearch = () => {
    const apiStatus = status === "received" ? "" : status;
    dispatch(fetchDoctorCases({ q, status: apiStatus, doctorId, page: 1, limit }));
  };

  // 3) Changement d’onglet statut (les “Reçus” sont filtrés client)
  const onChangeStatus = (next: StatusFilter) => {
    setStatus(next);
    const apiStatus = next === "received" ? "" : next;
    dispatch(fetchDoctorCases({ q, status: apiStatus, doctorId, page: 1, limit }));
  };

  // 4) Pagination
  const onPage = (p: number) => {
    const apiStatus = status === "received" ? "" : status;
    dispatch(fetchDoctorCases({ q, status: apiStatus, doctorId, page: p, limit }));
  };

  // 5) Items affichés (filtrage client pour “Reçus” uniquement)
  const displayedItems = useMemo(() => {
    const items = data.items || [];
    if (status === "received") {
      return items.filter((c: any) => !!c?.caseApproval?.approved);
    }
    if (status === "pending" || status === "scheduled" || status === "delivered") {
      return items.filter((c: any) => (c?.delivery?.status ?? "pending") === status);
    }
    return items;
  }, [data.items, status]);

  const clientFiltered = status === "received";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dossiers</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Consultez et accusez réception de vos cas.</p>
        </div>
        <button
          onClick={() => {
            const apiStatus = status === "received" ? "" : status;
            dispatch(fetchDoctorCases({ q, status: apiStatus, doctorId, page: data.page || 1, limit }));
          }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-zinc-900"
          title="Rafraîchir"
        >
          <FiRefreshCw /> Rafraîchir
        </button>
      </div>

      {/* Toolbar */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 p-[1px]">
        <div className="rounded-3xl bg-white dark:bg-[#111827]">
          <div className="px-4 sm:px-6 py-4 space-y-4">
            {/* Ligne 1 : Recherche + Statuts */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,26rem)_1fr] gap-3">
              {/* Recherche */}
              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1">Recherche</label>
                <div className="relative">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    placeholder="Code, patient…"
                    className="h-10 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#0b0b0c] pl-9 pr-28 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="h-9 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#0b0b0c] px-2 text-sm"
                      title="Lignes par page"
                    >
                      {[10, 20, 50].map((n) => (
                        <option key={n} value={n}>{n}/page</option>
                      ))}
                    </select>
                    <button
                      onClick={onSearch}
                      className="h-9 px-3 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                    >
                      Rechercher
                    </button>
                  </div>
                </div>
              </div>

              {/* Statuts (pills) */}
              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1">Statut</label>
                <div className="w-full overflow-x-auto">
                  <div className="inline-flex rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#0b0b0c] p-1 shadow-sm">
                    {STATUS_TABS.map((tab) => (
                      <button
                        key={tab.key || "all"}
                        type="button"
                        onClick={() => onChangeStatus(tab.key)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition whitespace-nowrap ${
                          status === tab.key ? "bg-indigo-600 text-white shadow" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900"
                        }`}
                        aria-pressed={status === tab.key}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                {clientFiltered && (
                  <div className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <FiInfo className="mt-[2px]" />
                    <span>Filtre “Reçus” appliqué côté interface (les pages restent basées sur la liste complète).</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-auto rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827]">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50 dark:bg-zinc-900/60">
            <tr>
              <th className="text-left px-4 py-2">Code</th>
              <th className="text-left px-4 py-2">Patient</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Livraison</th>
              <th className="text-left px-4 py-2">Réception</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6" colSpan={6}>Chargement…</td></tr>
            ) : error ? (
              <tr><td className="px-4 py-6 text-rose-600" colSpan={6}>
                {Array.isArray(error) ? error.join(", ") : String(error)}
              </td></tr>
            ) : displayedItems.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={6}>Aucun dossier</td></tr>
            ) : displayedItems.map((c: any) => {
              const deliveryStatus = c?.delivery?.status ?? "pending";
              const isDelivered = deliveryStatus === "delivered";
              const alreadyReceived = !!c?.caseApproval?.approved;

              return (
                <tr key={c.id || c._id} className="border-t border-gray-100 dark:border-zinc-800">
                  <td className="px-4 py-2 font-medium">{c.code}</td>
                  <td className="px-4 py-2">{c.patient?.name || "—"}</td>
                  <td className="px-4 py-2">{c.type?.name || c.type?.key || "—"}</td>
                  <td className="px-4 py-2">
                    <span className={badgeDeliveryCls(deliveryStatus)}>{labelDelivery(deliveryStatus)}</span>
                  </td>
                  <td className="px-4 py-2">
                    {alreadyReceived ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                        Reçu
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                        En attente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className={`rounded-xl px-3 py-1 ${alreadyReceived ? "border border-gray-300 dark:border-zinc-700 text-gray-500" : "text-white"} ${
                        !alreadyReceived && isDelivered ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-300 dark:bg-zinc-700 cursor-not-allowed"
                      }`}
                      disabled={alreadyReceived || !isDelivered}
                      onClick={() => isDelivered && !alreadyReceived && dispatch(approveCaseApi(c.id || c._id))}
                      title={
                        alreadyReceived
                          ? "Déjà reçu"
                          : isDelivered
                          ? "Marquer comme reçu"
                          : "Disponible uniquement quand le dossier est livré"
                      }
                    >
                      {alreadyReceived ? "✓ Reçu" : "Marquer comme reçu"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-2 justify-end">
        <button
          className="px-3 py-1 rounded-xl border border-gray-300 dark:border-zinc-700 disabled:opacity-50"
          disabled={!data.hasPrev || loading}
          onClick={() => onPage(Math.max(1, (data.page - 1)))}
        >
          <FiChevronLeft className="inline -mt-[2px]" /> Précédent
        </button>
        <span className="text-sm">
          Page {data.page} / {data.pages} — {data.total} au total
        </span>
        <button
          className="px-3 py-1 rounded-xl border border-gray-300 dark:border-zinc-700 disabled:opacity-50"
          disabled={!data.hasNext || loading}
          onClick={() => onPage(Math.min(data.pages, (data.page + 1)))}
        >
          Suivant <FiChevronRight className="inline -mt-[2px]" />
        </button>
      </div>
    </div>
  );
}
