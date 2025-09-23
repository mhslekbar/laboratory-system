// src/components/patients/ToolbarPatient.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { ShowPatientApi } from "../../redux/patients/PatientApiCalls";
import DoctorAutoComplete from "./DoctorAutoComplete";

type Meta = {
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type Props = {
  canManage: boolean;
  meta: Meta;
  initial?: { q?: string; doctorId?: string; limit?: number };
  onAddPatient?: () => void;
};

const useDebounced = (value: string, delay = 400) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const PatientsToolbar: React.FC<Props> = ({
  canManage,
  meta,
  initial,
  onAddPatient,
}) => {
  const dispatch: any = useDispatch();

  const [q, setQ] = useState(initial?.q || "");
  const [doctorId, setDoctorId] = useState(initial?.doctorId || "");
  const [limit, setLimit] = useState(initial?.limit || meta.limit || 10);

  const debouncedQ = useDebounced(q, 400);

  // Recherche (debounced)
  useEffect(() => {
    dispatch(
      ShowPatientApi({
        q: debouncedQ,
        page: 1,
        limit,
        ...(canManage && doctorId ? { doctorId } : {}),
      })
    );
  }, [debouncedQ]); // eslint-disable-line

  const changeLimit = (n: number) => {
    setLimit(n);
    dispatch(
      ShowPatientApi({
        q: debouncedQ,
        page: 1,
        limit: n,
        ...(canManage && doctorId ? { doctorId } : {}),
      })
    );
  };

  const goPage = (p: number) => {
    dispatch(
      ShowPatientApi({
        q: debouncedQ,
        page: p,
        limit,
        ...(canManage && doctorId ? { doctorId } : {}),
      })
    );
  };

  const canPrev = meta?.hasPrev;
  const canNext = meta?.hasNext;

  const pageInfo = useMemo(
    () =>
      `Page ${meta?.page ?? 1} / ${meta?.pages ?? 1} — ${
        meta?.total ?? 0
      } total`,
    [meta]
  );

  const refresh = () => {
    dispatch(
      ShowPatientApi({
        q: debouncedQ,
        page: meta.page,
        limit,
        ...(canManage && doctorId ? { doctorId } : {}),
      })
    );
  };

  return (
    <>
      {/* Toolbar */}

      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 p-[1px]">
        <div className="rounded-3xl bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Patients</h2>
              <p className="text-xs text-gray-500">
                Recherchez, filtrez et paginez la liste.
              </p>
            </div>
            {canManage && onAddPatient && (
              <button
                type="button"
                onClick={onAddPatient}
                className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700"
              >
                Ajouter patient
              </button>
            )}
          </div>

          {/* Filtres + actions */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,22rem)_auto_auto] gap-3 sm:items-end">
              {/* Recherche */}
              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1">Recherche</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Nom, téléphone, notes…"
                  className="h-11 w-full rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Médecin (autocomplete) */}
              {canManage && (
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">
                    Filtrer par médecin
                  </label>
                  <DoctorAutoComplete
                    value={doctorId}
                    onChange={(value) => {
                      setDoctorId(value);
                      dispatch(
                        ShowPatientApi({
                          q: debouncedQ,
                          page: 1,
                          limit,
                          ...(value ? { doctorId: value } : {}),
                        })
                      );
                    }}
                    placeholder="Rechercher un médecin…"
                    className="w-full"
                  />
                </div>
              )}

              {/* Lignes */}
              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1">Lignes</label>
                <select
                  className="h-11 rounded-xl border px-2"
                  value={limit}
                  onChange={(e) => changeLimit(Number(e.target.value))}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rafraîchir */}
              <div className="flex sm:justify-end">
                <button
                  type="button"
                  onClick={refresh}
                  className="h-11 px-4 rounded-xl border text-sm hover:bg-gray-50 w-full sm:w-auto"
                >
                  Rafraîchir
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500 sm:text-right">
              {pageInfo}
            </div>

            {/* Pagination desktop/tablette */}
            <div className="hidden sm:flex items-center gap-2 justify-end">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => canPrev && goPage(meta.page - 1)}
                className="h-10 px-3 rounded-xl border text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                type="button"
                disabled={!canNext}
                onClick={() => canNext && goPage(meta.page + 1)}
                className="h-10 px-3 rounded-xl border text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination sticky mobile */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
      >
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
          <div className="text-[11px] text-gray-600">{pageInfo}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => canPrev && goPage(meta.page - 1)}
              className="h-9 px-3 rounded-xl border text-xs disabled:opacity-50 hover:bg-gray-50"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => canNext && goPage(meta.page + 1)}
              className="h-9 px-3 rounded-xl border text-xs disabled:opacity-50 hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientsToolbar;
