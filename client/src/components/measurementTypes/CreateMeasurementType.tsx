// components/measurementTypes/CreateMeasurementType.tsx
import React, { useMemo, useState, useEffect } from "react";
import InputsMeasurementTypes from "./forms/InputsMeasurementTypes";
import RoleCheckboxList from "./parts/RoleCheckboxList";
import { useDispatch } from "react-redux";
import {  State } from "../../redux/store";
import { createMeasurementType, fetchMeasurementTypes } from "../../redux/measurementTypes/thunks";
import DuplicateStagesModal from "./DuplicateStagesModal";
import type { MeasurementTypeDto, StageTemplate } from "../../redux/measurementTypes/api";
import { useSelector } from "react-redux";

type Props = { open: boolean; onClose: () => void };

const emptyStage: StageTemplate = { name: "", order: undefined, color: "#2563eb", allowedRoles: [] };

const CreateMeasurementType: React.FC<Props> = ({ open, onClose }) => {
  const dispatch: any = useDispatch();

  // Rôles depuis le store via useSelect
  const { roles } = useSelector((s: State) => (s as any).roles) as unknown as { roles: { _id: string; name: string }[] };

  // Types existants pour la duplication
  const { items: existingTypes } = useSelector((s: State) => (s as any).measurementTypes || { items: [] });

  const [editing, setEditing] = useState<MeasurementTypeDto>({ key: "", name: "", stages: [] });
  const [saving, setSaving] = useState(false);
  const [duplicateFromId, setDuplicateFromId] = useState<string>("");
  const [dupModalOpen, setDupModalOpen] = useState(false);

  useEffect(() => {
    if (open && (!existingTypes || (existingTypes as any[]).length === 0)) {
      dispatch(fetchMeasurementTypes({ page: 1, limit: 100 }));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) {
      // reset quand on ferme
      setEditing({ key: "", name: "", stages: [] });
      setDuplicateFromId("");
      setDupModalOpen(false);
    }
  }, [open]);

  const addLocalStage = () => {
    const maxOrder = Math.max(0, ...(editing.stages || []).map((s) => s.order || 0));
    setEditing((prev) => ({
      ...prev,
      stages: [...(prev.stages || []), { ...emptyStage, order: maxOrder + 1 }],
    }));
  };
  const removeLocalStage = (idx: number) => {
    setEditing((prev) => {
      const next = [...(prev.stages || [])]
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, order: i + 1 }));
      return { ...prev, stages: next };
    });
  };
  const moveStage = (idx: number, dir: -1 | 1) => {
    setEditing((prev) => {
      const arr = [...(prev.stages || [])];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      const renum = arr.map((s, i) => ({ ...s, order: i + 1 }));
      return { ...prev, stages: renum };
    });
  };
  const updateStageField = (idx: number, field: keyof StageTemplate, value: any) => {
    setEditing((prev) => {
      const arr = [...(prev.stages || [])];
      arr[idx] = {
        ...arr[idx],
        [field]: field === "order" ? (value ? Number(value) : undefined) : value,
      } as StageTemplate;
      return { ...prev, stages: arr };
    });
  };

  const onDuplicateClick = () => {
    if (!duplicateFromId) return;
    setDupModalOpen(true);
  };

  const onConfirmDuplicate = (chosen: StageTemplate[]) => {
    // fusion + renumérotation
    const merged = [...(editing.stages || []), ...chosen.map((s) => ({ ...s, _id: undefined }))];
    const normalized = merged
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((s, i) => ({ ...s, order: i + 1 }));
    setEditing((prev) => ({ ...prev, stages: normalized }));
    setDupModalOpen(false);
  };

  const onSave = async () => {
    if (!editing.key.trim() || !editing.name.trim()) {
      alert("‘clé’ et ‘nom’ sont obligatoires.");
      return;
    }
    const normalizedStages = (editing.stages || [])
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((s, i) => ({
        name: (s.name || "").trim(),
        color: (s.color || "").trim(),
        order: i + 1,
        allowedRoles: Array.isArray(s.allowedRoles) ? s.allowedRoles : [],
      }))
      .filter((s) => s.name);

    try {
      setSaving(true);
      const ok = await dispatch(
        createMeasurementType({
          key: editing.key.trim(),
          name: editing.name.trim(),
          stages: normalizedStages,
        })
      );
      if (ok) {
        await dispatch(fetchMeasurementTypes({ page: 1 }));
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const sourceType = useMemo(
    () => (existingTypes || []).find((t: MeasurementTypeDto) => t._id === duplicateFromId) || null,
    [duplicateFromId, existingTypes]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-sky-500 text-white">
          <h2 className="text-lg font-semibold">Nouveau type de mesure</h2>
          <p className="text-xs opacity-90">
            Définissez la clé, le nom et ajoutez directement les étapes (ou dupliquez depuis un autre type).
          </p>
        </div>

        {/* Body scrollable */}
        <div className="max-h-[75vh] overflow-y-auto p-5 space-y-6">
          <InputsMeasurementTypes editing={editing as any} setEditing={setEditing as any} />

          {/* Duplication (avec sélection avancée) */}
          <div className="rounded-xl border p-3 bg-gray-50/60">
            <div className="flex flex-col sm:flex-row sm:items-end gap-2">
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-medium mb-1">Dupliquer les étapes depuis…</label>
                <select
                  value={duplicateFromId}
                  onChange={(e) => setDuplicateFromId(e.target.value)}
                  className="h-11 rounded-xl border px-3"
                >
                  <option value="">— Sélectionner un type —</option>
                  {(existingTypes || []).map((t: MeasurementTypeDto) => (
                    <option key={t._id || t.key} value={t._id}>
                      {t.name} — {t.key}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={onDuplicateClick}
                disabled={!duplicateFromId}
                className="h-11 px-4 rounded-xl border bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sélectionner les étapes…
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              Choisissez précisément quelles étapes copier (elles seront ajoutées à la suite).
            </p>
          </div>

          {/* ÉTAPES locales */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Étapes</h3>
            <button onClick={addLocalStage} className="px-3 py-2 rounded-xl border hover:bg-gray-50">
              Ajouter une étape
            </button>
          </div>

          <div className={`overflow-x-auto border rounded-2xl`}>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 w-20">Ordre</th>
                  <th className="text-left px-3 py-2">Nom</th>
                  <th className="text-left px-3 py-2 w-40">Couleur</th>
                  <th className="text-left px-3 py-2">Rôles autorisés</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(editing.stages || [])
                  .slice()
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((s, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={s.order || idx + 1}
                            onChange={(e) => updateStageField(idx, "order", e.target.value)}
                            className="h-9 w-20 rounded-xl border px-2"
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveStage(idx, -1)}
                              className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveStage(idx, +1)}
                              className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <input
                          value={s.name}
                          onChange={(e) => updateStageField(idx, "name", e.target.value)}
                          className="h-9 rounded-xl border px-2 w-full"
                          placeholder="Libellé"
                        />
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={s.color || "#2563eb"}
                            onChange={(e) => updateStageField(idx, "color", e.target.value)}
                            className="h-9 w-16 rounded border"
                          />
                          <input
                            value={s.color || ""}
                            onChange={(e) => updateStageField(idx, "color", e.target.value)}
                            className="h-9 rounded-xl border px-2 w-28 font-mono"
                            placeholder="#RRGGBB"
                          />
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <RoleCheckboxList
                          roles={roles || []}
                          value={s.allowedRoles || []}
                          onChange={(vals) => updateStageField(idx, "allowedRoles", vals)}
                          namePrefix={`create-role-${idx}`}
                        />
                      </td>

                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => removeLocalStage(idx)}
                          className="px-3 py-1 rounded-xl border text-rose-600 hover:bg-rose-50"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                {(!editing.stages || editing.stages.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                      Aucune étape — cliquez sur « Ajouter » ou « Sélectionner les étapes… »
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Création…" : "Créer"}
          </button>
        </div>
      </div>

      {/* Modal duplication */}
      <DuplicateStagesModal
        open={dupModalOpen}
        source={sourceType as any}
        onClose={() => setDupModalOpen(false)}
        onConfirm={onConfirmDuplicate}
      />
    </div>
  );
};

export default CreateMeasurementType;
