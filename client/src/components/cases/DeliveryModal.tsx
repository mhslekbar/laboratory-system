// src/components/cases/DeliveryModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiUserCheck, FiX, FiChevronDown } from "react-icons/fi";

type Approver = { _id: string; label: string };

type DeliveryModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (args: { approvedBy: string }) => Promise<void> | void;
  initial?: {
    approvedBy?: string | null;
  };
  approvers?: Approver[];
};

const DeliveryModal: React.FC<DeliveryModalProps> = ({
  open,
  onClose,
  onSubmit,
  initial,
  approvers = [],
}) => {
  const { t } = useTranslation();

  const [approvedBy, setApprovedBy] = useState<string>(initial?.approvedBy ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setApprovedBy(initial?.approvedBy ?? "");
    setQuery("");
    setOpenList(false);
  }, [open, initial?.approvedBy]);

  const [query, setQuery] = useState("");
  const [openList, setOpenList] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const selected = useMemo(
    () => approvers.find((a) => a._id === approvedBy),
    [approvedBy, approvers]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = approvers;
    if (!q) return base.slice(0, 50);
    return base
      .filter((a) => (a.label || "").toLowerCase().includes(q))
      .slice(0, 50);
  }, [approvers, query]);

  const canSubmit = !!approvedBy && !busy;

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    try {
      await onSubmit({ approvedBy });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold">{t("Marquer comme reçu")}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("Indiquez qui a reçu le cas.")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Combobox approver */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">
              {t("Reçu par")}
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiUserCheck />
              </span>

              <input
                ref={inputRef}
                value={openList ? query : selected?.label ?? ""}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpenList(true);
                }}
                onFocus={() => setOpenList(true)}
                placeholder={t("— Sélectionner —") as string}
                className="w-full rounded-lg border pl-10 pr-10 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                aria-autocomplete="list"
              />

              {selected?.label ? (
                <button
                  type="button"
                  onClick={() => {
                    setApprovedBy("");
                    setQuery("");
                    setOpenList(true);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                  title={t("Effacer") as string}
                  aria-label={t("Effacer") as string}
                >
                  <FiX />
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setOpenList((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                title={t("Afficher la liste") as string}
                aria-label={t("Afficher la liste") as string}
              >
                <FiChevronDown />
              </button>

              {openList && (
                <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-xl border bg-white shadow">
                  {filtered.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {t("Aucun résultat")}
                    </div>
                  ) : (
                    filtered.map((a) => {
                      const active = a._id === approvedBy;
                      return (
                        <button
                          key={a._id}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => {
                            setApprovedBy(a._id);
                            setQuery(a.label);
                            setOpenList(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                            active ? "bg-indigo-50" : ""
                          }`}
                        >
                          {a.label}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {!approvedBy && (
              <p className="mt-1 text-xs text-rose-600">
                {t("Sélectionnez la personne qui a reçu le cas.")}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border text-sm hover:bg-gray-50"
              disabled={busy}
            >
              {t("Annuler")}
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl border text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              disabled={!canSubmit}
            >
              {busy ? t("Enregistrement…") : t("Confirmer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryModal;
