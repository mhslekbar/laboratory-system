// components/measurementTypes/UpdateMeasurementType.tsx
import React, { useEffect, useMemo, useState } from "react";
import InputsMeasurementTypes from "./forms/InputsMeasurementTypes";
import RoleCheckboxList from "./parts/RoleCheckboxList";
import type { MeasurementTypeDto, StageTemplate } from "../../redux/measurementTypes/api";
import { useDispatch } from "react-redux";
import { State } from "../../redux/store";
import { fetchMeasurementTypes, updateMeasurementType } from "../../redux/measurementTypes/thunks";
import AddStage from "./cible/AddStage";
import EditStage from "./cible/EditStage";
import DeleteStage from "./cible/DeleteStage";
import DuplicateStagesModal from "./DuplicateStagesModal";
import { useSelector } from "react-redux";

type Props = {
  open: boolean;
  onClose: () => void;
  value: MeasurementTypeDto | null;
};

const UpdateMeasurementType: React.FC<Props> = ({ open, onClose, value }) => {
  const dispatch: any = useDispatch();

  // Rôles depuis le store
  const { roles } = useSelector((s: State) => (s as any).roles) as unknown as { roles: { _id: string; name: string }[] };

  // Types pour duplication
  const { items: existingTypes } = useSelector((s: State) => (s as any).measurementTypes || { items: [] });

  const [editing, setEditing] = useState<MeasurementTypeDto>({ key: "", name: "", stages: [] });
  const [saving, setSaving] = useState(false);

  const [stageAddOpen, setStageAddOpen] = useState(false);
  const [stageEditOpen, setStageEditOpen] = useState<{ open: boolean; stageId?: string }>({ open: false });
  const [stageDeleteOpen, setStageDeleteOpen] = useState<{ open: boolean; stageId?: string }>({ open: false });

  // Duplication
  const [duplicateFromId, setDuplicateFromId] = useState<string>("");
  const [dupModalOpen, setDupModalOpen] = useState(false);

  useEffect(() => {
    if (value) setEditing(JSON.parse(JSON.stringify(value)));
  }, [value]);

  useEffect(() => {
    if (open && (!existingTypes || (existingTypes as any[]).length === 0)) {
      dispatch(fetchMeasurementTypes({ page: 1, limit: 100 }));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const normalizeOrder = (stages: StageTemplate[]) =>
    stages
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((s, i) => ({ ...s, order: i + 1 }));

  const onSave = async () => {
    if (!editing.name.trim()) return alert("‘nom’ est obligatoire.");

    try {
      setSaving(true);
      const ok = await dispatch(
        updateMeasurementType(value?._id!, {
          name: editing.name.trim(),
          stages: editing.stages,
        })
      );
      if (ok) {
        await dispatch(fetchMeasurementTypes());
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const moveStage = (idx: number, dir: -1 | 1) => {
    setEditing((prev) => {
      const arr = [...(prev.stages || [])];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...prev, stages: normalizeOrder(arr) };
    });
  };

  const updateStageField = (idx: number, field: keyof StageTemplate, value: any) => {
    setEditing((prev) => {
      const arr = [...(prev.stages || [])];
      const next: StageTemplate = {
        ...arr[idx],
        [field]: field === "order" ? (value ? Number(value) : undefined) : value,
      } as StageTemplate;
      arr[idx] = next;
      const out = field === "order" ? normalizeOrder(arr) : arr;
      return { ...prev, stages: out };
    });
  };

  // Duplication logique
  const sourceType = useMemo(
    () => (existingTypes || []).find((t: MeasurementTypeDto) => t._id === duplicateFromId) || null,
    [duplicateFromId, existingTypes]
  );

  const onConfirmDuplicate = (chosen: StageTemplate[]) => {
    const merged = [...(editing.stages || []), ...chosen.map((s) => ({ ...s, _id: undefined }))];
    setEditing((prev) => ({ ...prev, stages: normalizeOrder(merged) }));
    setDupModalOpen(false);
  };

  if (!open || !value) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-500 text-white">
          <h2 className="text-lg font-semibold">Modifier le type</h2>
          <p className="text-xs opacity-90">{editing.key}</p>
        </div>

        {/* Body scrollable */}
        <div className="max-h-[75vh] overflow-y-auto p-5 space-y-6">
          <InputsMeasurementTypes editing={editing as any} setEditing={setEditing as any} disabledKey />

          {/* Duplication */}
          <div className="rounded-xl border p-3 bg-gray-50/60">
            <div className="flex flex-col sm:flex-row sm:items-end gap-2">
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-medium mb-1">Dupliquer des étapes depuis…</label>
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
                onClick={() => setDupModalOpen(true)}
                disabled={!duplicateFromId}
                className="h-11 px-4 rounded-xl border bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sélectionner les étapes…
              </button>
              <button onClick={() => setStageAddOpen(true)} className="h-11 px-4 rounded-xl border bg-white hover:bg-gray-50">
                Ajouter une étape
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              Choisissez précisément quelles étapes copier. Elles seront ajoutées à la suite.
            </p>
          </div>

          {/* Table Étapes (édition inline) */}
          <div className={`overflow-x-auto border rounded-2xl`}>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 w-24">Ordre</th>
                  <th className="text-left px-3 py-2">Nom</th>
                  <th className="text-left px-3 py-2 w-48">Couleur</th>
                  <th className="text-left px-3 py-2">Rôles autorisés</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {editing.stages
                  ?.slice()
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((s, idx) => {
                    return (
                      <tr key={s._id || idx} className="border-t">
                        {/* Ordre + move */}
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
                              <button onClick={() => moveStage(idx, -1)} className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50">
                                ↑
                              </button>
                              <button onClick={() => moveStage(idx, +1)} className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50">
                                ↓
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Nom (editable) */}
                        <td className="px-3 py-2">
                          <input
                            value={s.name}
                            onChange={(e) => updateStageField(idx, "name", e.target.value)}
                            className="h-9 rounded-xl border px-2 w-44"
                            placeholder="Libellé"
                          />
                        </td>

                        {/* Couleur (editable) */}
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

                        {/* Rôles autorisés (checkbox) */}
                        <td className="px-3 py-2">
                          <RoleCheckboxList
                            roles={roles || []}
                            value={s.allowedRoles || []}
                            onChange={(vals) => updateStageField(idx, "allowedRoles", vals)}
                            namePrefix={`update-role-${idx}`}
                          />
                        </td>

                        {/* Actions secondaires (ouvrir modals ciblés) */}
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            {s._id && (
                              <>
                                <button
                                  onClick={() => setStageEditOpen({ open: true, stageId: String(s._id) })}
                                  className="px-3 py-1 rounded-xl border hover:bg-gray-50"
                                >
                                  Éditer…
                                </button>
                                <button
                                  onClick={() => setStageDeleteOpen({ open: true, stageId: String(s._id) })}
                                  className="px-3 py-1 rounded-xl border text-rose-600 hover:bg-rose-50"
                                >
                                  Supprimer
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {(!editing.stages || editing.stages.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                      Aucune étape
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
            Fermer
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Modaux Étapes */}
      {stageAddOpen && <AddStage typeId={value._id!} onClose={() => setStageAddOpen(false)} />}
      {stageEditOpen.open && stageEditOpen.stageId && (
        <EditStage typeId={value._id!} stageId={stageEditOpen.stageId} onClose={() => setStageEditOpen({ open: false })} />
      )}
      {stageDeleteOpen.open && stageDeleteOpen.stageId && (
        <DeleteStage typeId={value._id!} stageId={stageDeleteOpen.stageId} onClose={() => setStageDeleteOpen({ open: false })} />
      )}

      {/* Duplication avancée */}
      <DuplicateStagesModal
        open={dupModalOpen}
        source={sourceType as any}
        onClose={() => setDupModalOpen(false)}
        onConfirm={onConfirmDuplicate}
      />
    </div>
  );
};

export default UpdateMeasurementType;
