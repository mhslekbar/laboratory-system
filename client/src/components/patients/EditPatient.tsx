// src/components/patients/EditPatient.tsx
import React, { useContext, useState } from "react";
import InputsAddPatient from "./forms/InputsAddPatient";
import { AddPatientContext, PatientInterface, toInputDate } from "./types";
import { bindActionCreators } from "redux";
import { EditPatientApi } from "../../redux/patients/PatientApiCalls";
import { useDispatch, useSelector } from "react-redux";
import { Timeout } from "../../functions/functions";
import { ShowPatientContext } from "./ShowPatients";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";
import { State } from "../../redux/store";

interface EditPatientInterface {
  modal: boolean;
  toggle: () => void;
  patient: PatientInterface;
}

const EditPatient: React.FC<EditPatientInterface> = ({ modal, toggle, patient }) => {
  const [name, setName] = useState<string>(patient.name || "");
  const [phone, setPhone] = useState<string>(patient.phone || "");
  const [dob, setDob] = useState<string>(toInputDate(patient.dob));
  const [notes, setNotes] = useState<string>(patient.notes || "");

  // init doctor
  const initialDoctorId = (() => {
    if (!patient?.doctor) return "";
    if (typeof patient.doctor === "string") return patient.doctor;
    return (patient.doctor as any)?._id || "";
  })();
  const [doctorId, setDoctorId] = useState<string>(initialDoctorId);

  const { setSuccessMsg } = useContext(ShowPatientContext);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const bound = bindActionCreators({ EditPatientApi }, dispatch as any);

  const user = useSelector((s: State) => (s as any)?.login?.userData) || {};
  const isDoctor = !!user?.doctor?.isDoctor;
  const canManage = !isDoctor;

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Escape") toggle();
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      const form = document.getElementById("edit-patient-form") as HTMLFormElement | null;
      form?.requestSubmit();
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const data: any = { name, phone, notes, dob };
    if (canManage) data.doctorId = doctorId || undefined;

    const errs: string[] = [];
    if (!name.trim()) errs.push("Le nom est obligatoire.");
    if (canManage && !doctorId) errs.push("Veuillez sélectionner un médecin.");
    if (errs.length) { setErrors(errs); return; }

    try {
      setLoading(true);
      const response = await bound.EditPatientApi(patient?._id, data);
      if (typeof response === "boolean") {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), Timeout);
        toggle();
      } else if (Array.isArray(response)) {
        setErrors(response);
      }
    } catch (err) {
      console.log("Err: ", err);
    } finally {
      setLoading(false);
    }
  };

  if (!modal) return null;

  return (
    <AddPatientContext.Provider
      value={{
        name, setName,
        phone, setPhone,
        dob, setDob,
        notes, setNotes,
        doctorId, setDoctorId,
      }}
    >
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3"
        role="dialog"
        aria-modal="true"
        onKeyDown={onKeyDown}
      >
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-500 text-white">
            <h2 className="text-lg font-semibold">Modifier le patient</h2>
            <p className="text-xs opacity-90">{patient?.name || "—"}</p>
          </div>

          {/* Body scrollable */}
          <div className="max-h-[80vh] overflow-y-auto p-5">
            <ShowErrorMsg errors={errors} setErrors={setErrors} />
            <form id="edit-patient-form" className="space-y-5" onSubmit={handleSubmit}>
              <InputsAddPatient showDoctor={canManage} />
            </form>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
            <button onClick={toggle} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">Annuler</button>
            <button
              form="edit-patient-form"
              type="submit"
              disabled={loading}
              className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
              title="Ctrl/Cmd + Entrée pour enregistrer"
            >
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </AddPatientContext.Provider>
  );
};

export default EditPatient;
