// src/components/cases/EditCaseModal.tsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Option = { _id: string; label: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (patch: {
    doctor?: string;
    patient?: string;
    type?: string;
    note?: string;
  }) => Promise<void> | void;
  initial?: {
    doctor?: string;
    patient?: string;
    type?: string;
    note?: string;
    code?: string;
  };
  doctors?: Option[];
  patients?: Option[];
  types?: Option[];
};

const EditCaseModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  initial,
  doctors = [],
  patients = [],
  types = [],
}) => {
  const { t } = useTranslation();
  const [doctor, setDoctor] = useState(initial?.doctor || "");
  const [patient, setPatient] = useState(initial?.patient || "");
  const [type, setType] = useState(initial?.type || "");
  const [note, setNote] = useState(initial?.note || "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDoctor(initial?.doctor || "");
    setPatient(initial?.patient || "");
    setType(initial?.type || "");
    setNote(initial?.note || "");
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        doctor,
        patient,
        type,
        note: note?.trim() || undefined,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-sky-500 text-white">
          <h2 className="text-lg font-semibold">
            {t("Modifier le dossier")}
            {initial?.code ? ` — ${initial.code}` : ""}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] overflow-auto p-5 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">{t("Médecin")}</label>
              <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="h-11 rounded-xl border px-2"
              >
                <option value="">{t("— Sélectionner —")}</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">{t("Patient")}</label>
              <select
                value={patient}
                onChange={(e) => setPatient(e.target.value)}
                className="h-11 rounded-xl border px-2"
              >
                <option value="">{t("— Sélectionner —")}</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">
              {t("Type de mesure")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 rounded-xl border px-2"
            >
              <option value="">{t("— Sélectionner —")}</option>
              {types.map((ti) => (
                <option key={ti._id} value={ti._id}>
                  {ti.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">{t("Note")}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[90px] rounded-xl border px-3 py-2"
              placeholder={t("Informations complémentaires…") as string}
            />
          </div>

          <div className="pt-2 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50"
            >
              {t("Annuler")}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="h-10 px-4 rounded-xl bg-amber-500 text-white text-sm
                         hover:bg-amber-600 disabled:opacity-60"
            >
              {busy ? t("Enregistrement…") : t("Enregistrer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCaseModal;
