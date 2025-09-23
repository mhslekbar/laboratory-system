import React, { useEffect, useMemo, useState } from "react";
import { FiX, FiCalendar, FiCheck, FiFileText } from "react-icons/fi";

type Priority = "low" | "medium" | "high";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: {
    title?: string;
    priority?: Priority;
    dueAt?: string | null; // ISO ou "YYYY-MM-DD"
    notes?: string | null;
  };
  onSubmit: (payload: {
    title: string;
    priority: Priority;
    dueAt?: string | null;
    notes?: string | null;
  }) => Promise<void> | void;
};

const toYMD = (v?: string | null) => {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const TodoModal: React.FC<Props> = ({ open, onClose, initial, onSubmit }) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [dueAt, setDueAt] = useState<string>(toYMD(initial?.dueAt ?? ""));
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setPriority(initial?.priority ?? "medium");
    setDueAt(toYMD(initial?.dueAt ?? ""));
    setNotes(initial?.notes ?? "");
    setBusy(false);
  }, [open, initial]);

  const canSubmit = useMemo(() => title.trim().length > 0 && !busy, [title, busy]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    try {
      await onSubmit({
        title: title.trim(),
        priority,
        dueAt: dueAt || undefined,
        notes: notes?.trim() ? notes.trim() : undefined,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">{initial ? "Modifier la tâche" : "Nouvelle tâche"}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Fermer"
            title="Fermer"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">Titre</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Décrivez la tâche…"
              className="h-11 rounded-xl border px-3"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Priorité</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="h-11 rounded-xl border px-3"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Échéance</label>
              <div className="relative">
                <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="h-11 w-full rounded-xl border pl-9 pr-3"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">Notes</label>
            <div className="relative">
              <FiFileText className="pointer-events-none absolute left-3 top-3 text-gray-400" />
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Détails, liens, checklist…"
                className="w-full rounded-xl border pl-9 pr-3 py-2 resize-y"
              />
            </div>
          </div>

          <div className="pt-2 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50"
              disabled={busy}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60 inline-flex items-center gap-2"
            >
              <FiCheck />
              {busy ? "Enregistrement…" : initial ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoModal;
