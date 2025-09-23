// components/measurementTypes/DuplicateStagesModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { MeasurementTypeDto, StageTemplate } from "./types";

type Props = {
  open: boolean;
  source?: MeasurementTypeDto | null; // type depuis lequel on duplique
  excludeKeys?: string[];             // clés déjà présentes pour éviter doublons
  onClose: () => void;
  onConfirm: (stages: StageTemplate[]) => void; // étapes choisies
};

const DuplicateStagesModal: React.FC<Props> = ({ open, source, excludeKeys = [], onClose, onConfirm }) => {
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (!open || !source) return;
    // Pré-cocher tout ce qui n'est pas exclu
    const next: Record<string, boolean> = {};
    (source.stages || []).forEach(s => {
      if (!excludeKeys.includes(s.key)) next[s.key] = true;
    });
    setChecked(next);
    setSelectAll(true);
    setQuery("");
  }, [excludeKeys, open, source]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (source?.stages || []).filter(s => !excludeKeys.includes(s.key));
    if (!q) return list;
    return list.filter(s =>
      (s.key || "").toLowerCase().includes(q) ||
      (s.name || "").toLowerCase().includes(q)
    );
  }, [query, source, excludeKeys]);

  const visibleCount = filtered.length;
  const selectedCount = filtered.filter(s => checked[s.key]).length;

  const toggleOne = (key: string) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    setChecked(prev => {
      const copy = { ...prev };
      filtered.forEach(s => { copy[s.key] = next; });
      return copy;
    });
  };

  const confirm = () => {
    const chosen = (source?.stages || []).filter(s => checked[s.key] && !excludeKeys.includes(s.key));
    onConfirm(chosen);
  };

  if (!open || !source) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-cyan-600 to-sky-500 text-white">
          <h2 className="text-lg font-semibold">Dupliquer des étapes</h2>
          <p className="text-xs opacity-90">Depuis « {source.name} — {source.key} »</p>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 flex flex-col">
              <label className="text-xs font-medium mb-1">Filtrer</label>
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Clé ou nom…" className="h-10 rounded-xl border px-3"/>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input id="selAll" type="checkbox" className="h-4 w-4" checked={selectAll} onChange={toggleAll} />
              <label htmlFor="selAll" className="text-sm select-none">Tout sélectionner</label>
            </div>
          </div>

          <div className="rounded-xl border divide-y">
            {filtered.map(s => (
              <label key={s.key} className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={!!checked[s.key]}
                    onChange={() => toggleOne(s.key)}
                  />
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full border" style={{ background: s.color || "#cbd5e1" }} />
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-xs opacity-60">({s.key})</span>
                  </div>
                </div>
                <span className="text-xs opacity-70">Ordre: {s.order}</span>
              </label>
            ))}
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