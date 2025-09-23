// src/components/cases/DeleteCaseModal.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  label?: string;
};

const DeleteCaseModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  label,
}) => {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-rose-600">
            {t("Supprimer le dossier")}
          </h3>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm">
            {t("Êtes-vous sûr de vouloir supprimer ce dossier")}{" "}
            {label ? <strong>{label}</strong> : null} ?
          </p>
          <p className="text-xs text-gray-500">
            {t("Cette action est irréversible.")}
          </p>
        </div>

        <div className="px-5 pb-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border text-sm hover:bg-gray-50"
          >
            {t("Annuler")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="px-3 py-1.5 rounded-xl text-sm font-semibold shadow-sm
                       bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {busy ? t("Suppression…") : t("Supprimer")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCaseModal;
