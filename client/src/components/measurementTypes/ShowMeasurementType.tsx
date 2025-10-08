// components/measurementTypes/ShowMeasurementType.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../redux/store";
import { fetchMeasurementTypes } from "../../redux/measurementTypes/thunks";
import TableMeasurementType from "./TableMeasurementType";
import CreateMeasurementType from "./CreateMeasurementType";
import UpdateMeasurementType from "./UpdateMeasurementType";
import DeleteMeasurementType from "./DeleteMeasurementType";
import { MeasurementTypeDto } from "./types";

const useDebounced = (v: string, d = 400) => {
  const [val, setVal] = useState(v);
  useEffect(() => { const t = setTimeout(()=>setVal(v), d); return ()=>clearTimeout(t); }, [v,d]);
  return val;
};

const ShowMeasurementType: React.FC = () => {
  const dispatch: any = useDispatch();
  const { items, meta } = useSelector((s: State) => (s as any).measurementTypes);
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(meta?.limit || 10);
  const debouncedQ = useDebounced(q, 400);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<MeasurementTypeDto | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<MeasurementTypeDto | null>(null);

  useEffect(() => {
    dispatch(fetchMeasurementTypes({ q: debouncedQ, page: 1, limit }));
  }, [debouncedQ, limit, dispatch]);

  const reload = (page = meta?.page || 1) =>
    dispatch(fetchMeasurementTypes({ q: debouncedQ, page, limit }));

  const pageInfo = useMemo(
    () => `Page ${meta?.page || 1} / ${meta?.pages || 1} — ${meta?.total || 0} total`,
    [meta]
  );

  return (
    <div className="p-4 sm:p-5 space-y-4 pb-24 sm:pb-0">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 p-[1px]">
        <div className="rounded-3xl bg-white p-4 sm:p-5">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold">Types de mesure</h1>
              <p className="text-xs text-gray-500">Configurez vos types et leurs étapes de fabrication.</p>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="h-10 sm:h-11 px-4 sm:px-5 rounded-2xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 w-full sm:w-auto"
            >
              Nouveau type
            </button>
          </div>

          {/* Toolbar */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_auto] gap-3 sm:items-end">
              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1">Recherche</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Clé, nom ou étapes…"
                  className="h-11 w-full rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-medium mb-1">Lignes</label>
                <select
                  className="h-11 rounded-xl border px-2"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className="flex sm:justify-end">
                <button
                  onClick={() => reload(1)}
                  className="h-11 px-4 rounded-xl border text-sm hover:bg-gray-50 w-full sm:w-auto"
                >
                  Rafraîchir
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500 sm:text-right">{pageInfo}</div>
          </div>
        </div>
      </div>

      {/* Table / Mobile cards */}
      <TableMeasurementType
        items={items || []}
        onEdit={(row) => setEditOpen(row)}
        onDelete={(row) => setDeleteOpen(row)}
      />

      {/* Pagination (desktop/tablette) */}
      <div className="hidden sm:flex items-center gap-2 justify-end">
        <button
          disabled={!meta?.hasPrev}
          onClick={() => reload((meta?.page || 1) - 1)}
          className="h-10 px-3 rounded-xl border text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Précédent
        </button>
        <button
          disabled={!meta?.hasNext}
          onClick={() => reload((meta?.page || 1) + 1)}
          className="h-10 px-3 rounded-xl border text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Suivant
        </button>
      </div>

      {/* Pagination sticky (mobile) */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
      >
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
          <div className="text-[11px] text-gray-600">{pageInfo}</div>
          <div className="flex items-center gap-2">
            <button
              disabled={!meta?.hasPrev}
              onClick={() => reload((meta?.page || 1) - 1)}
              className="h-9 px-3 rounded-xl border text-xs disabled:opacity-50 hover:bg-gray-50"
            >
              Précédent
            </button>
            <button
              disabled={!meta?.hasNext}
              onClick={() => reload((meta?.page || 1) + 1)}
              className="h-9 px-3 rounded-xl border text-xs disabled:opacity-50 hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Modales */}
      <CreateMeasurementType open={createOpen} onClose={() => setCreateOpen(false)} />
      <UpdateMeasurementType open={!!editOpen} onClose={() => setEditOpen(null)} value={editOpen} />
      <DeleteMeasurementType open={!!deleteOpen} onClose={() => setDeleteOpen(null)} id={(deleteOpen as any)?._id} name={deleteOpen?.name} />
    </div>
  );
};

export default ShowMeasurementType;
