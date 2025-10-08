// components/measurementTypes/DuplicateStagesModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { MeasurementTypeDto, StageTemplate } from "../../redux/measurementTypes/api";

type Props = {
  open: boolean;
  source?: MeasurementTypeDto | null; // type depuis lequel on duplique
  onClose: () => void;
  onConfirm: (stages: StageTemplate[]) => void; // étapes choisies
};

const DuplicateStagesModal: React.FC<Props> = ({ open, source, onClose, onConfirm }) => {
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (!open || !source) return;
    // pré-cocher tout
    const next: Record<string, boolean> = {};
    (source.stages || []).forEach((s) => {
      if (s._id) next[String(s._id)] = true;
    });
    setChecked(next);
    setSelectAll(true);
    setQuery("");
  }, [open, source]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (source?.stages || []);
    if (!q) return list;
    return list.filter((s) => (s.name || "").toLowerCase().includes(q));
  }, [query, source]);

  const visibleCount = filtered.length;
  const selectedCount = filtered.filter((s) => s._id && checked[String(s._id)]).length;

  const toggleOne = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    setChecked((prev) => {
      const copy = { ...prev };
      filtered.forEach((s) => {
        if (s._id) copy[String(s._id)] = next;
      });
      return copy;
    });
  };

  const confirm = () => {
    const chosen = (source?.stages || []).filter((s) => s._id && checked[String(s._id)]);
    onConfirm(
      chosen.map((s) => ({
        // on copie les champs utiles; _id sera ignoré à l’insertion
        name: s.name,
        color: s.color,
        order: s.order,
        allowedRoles: Array.isArray(s.allowedRoles) ? s.allowedRoles : [],
      }))
    );
  };

  if (!open || !source) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-cyan-600 to-sky-500 text-white">
          <h2 className="text-lg font-semibold">Dupliquer des étapes</h2>
          <p className="text-xs opacity-90">
            Depuis « {source.name} — {source.key} »
          </p>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 flex flex-col">
              <label className="text-xs font-medium mb-1">Filtrer</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom…" className="h-10 rounded-xl border px-3" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input id="selAll" type="checkbox" className="h-4 w-4" checked={selectAll} onChange={toggleAll} />
              <label htmlFor="selAll" className="text-sm select-none">Tout sélectionner</label>
            </div>
          </div>

          <div className="rounded-xl border divide-y">
            {filtered.map((s) => {
              const id = String(s._id || s.name); // fallback sur name si pas d'_id (rare en lecture)
              return (
                <label key={id} className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={!!checked[id]}
                      onChange={() => toggleOne(id)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full border" style={{ background: s.color || "#cbd5e1" }} />
                      <span className="text-sm font-medium">{s.name}</span>
                    </div>
                  </div>
                  <span className="text-xs opacity-70">Ordre: {s.order}</span>
                </label>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-gray-500 text-sm">Aucun résultat</div>
            )}
          </div>

          <div className="text-xs text-gray-500">{selectedCount}/{visibleCount} visibles sélectionnées</div>
        </div>

        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">Annuler</button>
          <button onClick={confirm} className="h-10 px-4 rounded-xl bg-cyan-600 text-white text-sm hover:bg-cyan-700">Dupliquer</button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateStagesModal;
