import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../redux/store";
import { ShowPatientApi } from "../../../redux/patients/PatientApiCalls";
import { UserData } from "../../../requestMethods";
import {
  FiSearch,
  FiPhone,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";

export default function DoctorPatients() {
  const dispatch: any = useDispatch();
  const doctorId = UserData()?._id;

  const { patients, isFetching, meta } = useSelector(
    (s: State) => (s as any).patients
  );
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState<number>(20);
  const [page, setPage] = useState<number>(1);

  // Charger côté API (si ton endpoint accepte doctorId; sinon on filtre client)
  useEffect(() => {
    dispatch(ShowPatientApi({ page, limit, doctorId, q }));
  }, [dispatch, doctorId, page, limit, q]);

  const filtered = useMemo(() => {
    const all = Array.isArray(patients) ? patients : [];
    // sécurité côté UI: filtrer par docteur et texte
    return all
      .filter((p: any) => {
        const did = p?.doctor?._id ?? p?.doctor;
        return !doctorId || did === doctorId;
      })
      .filter((p: any) => {
        const term = q.trim().toLowerCase();
        if (!term) return true;
        return (
          (p?.name && String(p.name).toLowerCase().includes(term)) ||
          (p?.phone && String(p.phone).toLowerCase().includes(term))
        );
      });
  }, [patients, doctorId, q]);

  const hasPrev = meta?.hasPrev ?? page > 1;
  const hasNext = meta?.hasNext ?? filtered.length >= limit; // approximation si meta absent

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Liste des patients rattachés au médecin connecté.
          </p>
        </div>
        <button
          onClick={() => dispatch(ShowPatientApi({ page, limit, doctorId, q }))}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-zinc-900"
          title="Rafraîchir"
        >
          <FiRefreshCw /> Rafraîchir
        </button>
      </div>

      {/* Toolbar */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 p-[1px]">
        <div className="rounded-3xl bg-white dark:bg-[#111827]">
          <div className="px-4 sm:px-6 py-4 space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,26rem)_auto] gap-3">
              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1">Recherche</label>
                <div className="relative">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setPage(1)}
                    placeholder="Nom, téléphone…"
                    className="h-10 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#0b0b0c] pl-9 pr-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">Lignes</label>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-10 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#0b0b0c] px-3"
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}/page
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 text-right text-sm text-gray-500 dark:text-gray-400">
                  {isFetching ? "Chargement…" : `${filtered.length} affichés`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Grid de cartes */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isFetching ? (
          <div className="col-span-full text-sm text-gray-600 dark:text-gray-300">
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-sm">Aucun patient</div>
        ) : (
          filtered.slice(0, limit).map((p: any) => (
            <div
              key={p._id || p.id}
              className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  {(p?.name || "?").substring(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate flex items-center gap-2">
                    <FiUser className="opacity-60" /> {p?.name || "Sans nom"}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 truncate flex items-center gap-2">
                    <FiPhone className="opacity-60" /> {p?.phone || "—"}
                  </div>
                </div>
              </div>
              {/* Extra actions si besoin (voir dossiers du patient…) */}
            </div>
          ))
        )}
      </div>

      {/* Pagination simple (basée sur l’état local / meta si dispo) */}
      <div className="flex items-center gap-2 justify-end">
        <button
          className="px-3 py-1 rounded-xl border border-gray-300 dark:border-zinc-700 disabled:opacity-50"
          disabled={!hasPrev || isFetching}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <FiChevronLeft className="inline -mt-[2px]" /> Précédent
        </button>
        <span className="text-sm">Page {page}</span>
        <button
          className="px-3 py-1 rounded-xl border border-gray-300 dark:border-zinc-700 disabled:opacity-50"
          disabled={!hasNext || isFetching}
          onClick={() => setPage((p) => p + 1)}
        >
          Suivant <FiChevronRight className="inline -mt-[2px]" />
        </button>
      </div>
    </div>
  );
}
