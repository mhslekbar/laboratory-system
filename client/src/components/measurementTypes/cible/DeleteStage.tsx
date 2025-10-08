// components/measurementTypes/cible/DeleteStage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../redux/store";
import { fetchMeasurementTypes, removeStage } from "../../../redux/measurementTypes/thunks";

type Props = {
  typeId: string;
  stageId: string;      // <- stageId au lieu de stageKey
  onClose: () => void;
};

const DeleteStage: React.FC<Props> = ({ typeId, stageId, onClose }) => {
  const dispatch: any = useDispatch();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Pour afficher le nom de l’étape dans l’UI
  const { items } = useSelector((s: State) => (s as any).measurementTypes);
  const type = items?.find((t: any) => String(t._id) === String(typeId));
  const stage = (type?.stages || []).find((s: any) => String(s._id) === String(stageId));
  const stageLabel = stage?.name || "cette étape";

  const inputRef = useRef<HTMLInputElement>(null);

  // On demande de taper SUPPRIMER pour confirmer
  const CONFIRM_WORD = "SUPPRIMER";
  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onConfirm = async () => {
    if (!canDelete) return;
    try {
      setLoading(true);
      const ok = await dispatch(removeStage(typeId, stageId));
      if (ok) {
        await dispatch(fetchMeasurementTypes());
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Escape") onClose();
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canDelete) onConfirm();
  };

  if (!stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3" onKeyDown={onKeyDown}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-600 to-orange-500 text-white">
          <h2 className="text-lg font-semibold">Supprimer l’étape</h2>
          <p className="text-xs opacity-90">Cette action est irréversible.</p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-sm">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
            Vous êtes sur le point de supprimer l’étape <span className="font-semibold">« {stageLabel} »</span>.
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">
              Pour confirmer, tapez <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{CONFIRM_WORD}</span>
            </label>
            <input
              ref={inputRef}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="h-11 w-full rounded-xl border px-3 outline-none focus:ring-2 focus:ring-rose-500"
              placeholder={CONFIRM_WORD}
              aria-label="Champ de confirmation"
            />
            <p className="text-[11px] text-gray-500">
              Astuce : <kbd className="px-1 py-0.5 bg-gray-100 rounded border">Ctrl</kbd>/<kbd className="px-1 py-0.5 bg-gray-100 rounded border">⌘</kbd> +{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 rounded border">Entrée</kbd> pour confirmer.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !canDelete}
            className="h-10 px-4 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-700 disabled:opacity-60"
            title={!canDelete ? `Tapez ${CONFIRM_WORD} pour activer la suppression` : ""}
          >
            {loading ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteStage;
