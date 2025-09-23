// src/components/patients/DeletePatient.tsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { PatientInterface } from "./types";
import { ShowPatientContext } from "./ShowPatients";
import { Timeout } from "../../functions/functions";
import { DeletePatientApi } from "../../redux/patients/PatientApiCalls";
import { bindActionCreators } from "redux";
import { useDispatch } from "react-redux";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";

interface DeletePatientInterface {
  modal: boolean;
  toggle: () => void;
  patient: PatientInterface;
}

const DeletePatient: React.FC<DeletePatientInterface> = ({ modal, toggle, patient }) => {
  const { setSuccessMsg } = useContext(ShowPatientContext);
  const [errors, setErrors] = useState<string[]>([]);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const canDelete = confirmText.trim() === (patient?.name || "");

  useEffect(() => { if (modal) inputRef.current?.focus(); }, [modal]);

  const onConfirm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canDelete) return;
    setLoading(true);
    try {
      const boundActions = bindActionCreators({ DeletePatientApi }, dispatch as any);
      const response = await boundActions.DeletePatientApi(patient._id);
      if (typeof response === "boolean") {
        setSuccessMsg(true);
        toggle();
        setTimeout(() => setSuccessMsg(false), Timeout);
      } else if (Array.isArray(response)) {
        setErrors(response);
      }
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Escape") toggle();
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canDelete) onConfirm();
  };

  if (!modal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3"
      role="dialog"
      aria-modal="true"
      onKeyDown={onKeyDown}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-600 to-orange-500 text-white">
          <h2 className="text-lg font-semibold">Supprimer le patient</h2>
          <p className="text-xs opacity-90">Action irréversible.</p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <ShowErrorMsg errors={errors} setErrors={setErrors} />
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 text-sm">
            Vous êtes sur le point de supprimer <b>{patient?.name || "—"}</b>.
            Cette action ne peut pas être annulée.
          </div>

          <form onSubmit={onConfirm} className="space-y-2">
            <label className="text-xs font-medium">
              Pour confirmer, tapez le nom :{" "}
              <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{patient?.name || "—"}</span>
            </label>
            <input
              ref={inputRef}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="h-11 w-full rounded-xl border px-3 outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Saisissez exactement le nom du patient"
            />
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button onClick={toggle} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">Annuler</button>
          <button
            onClick={() => onConfirm()}
            disabled={loading || !canDelete}
            className="h-10 px-4 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-700 disabled:opacity-60"
            title={!canDelete ? "Tapez le nom exact pour activer la suppression" : ""}
          >
            {loading ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePatient;
