// src/components/cases/CreateCase.tsx
import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { createCase, fetchCases } from "../../redux/cases/thunks"; // ← thunks
import NewDoctorModal from "./NewDoctorModal";
import NewPatientModal from "./NewPatientModal";
import { TbStethoscope } from "react-icons/tb";
import { FiUser, FiTag, FiCheckCircle } from "react-icons/fi";

type DoctorOption = { _id: string; label: string };
type PatientOption = { _id: string; label: string; doctor?: string | { _id: string } };
type TypeOption    = { _id: string; label: string };

type Props = {
  open: boolean;
  onClose: () => void;
  doctors?: DoctorOption[];
  patients?: PatientOption[];
  types?: TypeOption[];
};

const Combobox = ({
  value,
  onChange,
  items,
  placeholder,
  icon,
  disabled,
  noResultsLabel = "Aucun résultat",
  id,
}: {
  value: string;
  onChange: (id: string, label?: string) => void;
  items: Array<{ _id: string; label: string }>;
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  noResultsLabel?: string;
  id?: string;
}) => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => items.find(i => i._id === value), [items, value]);
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items.slice(0, 30);
    return items.filter(i => i.label?.toLowerCase().includes(qq)).slice(0, 30);
  }, [items, q]);

  return (
    <div className="relative">
      <div className="relative">
        {icon ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        ) : null}
        <input
          id={id}
          disabled={disabled}
          value={open ? q : (selected?.label ?? "")}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border ${icon ? "pl-10 pr-10" : "px-3"} outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100`}
          aria-autocomplete="list"
          aria-controls={id ? `${id}-listbox` : undefined}
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          aria-label="Ouvrir/fermer"
        >
          ▾
        </button>
      </div>

      {open && !disabled && (
        <div
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-xl border bg-white shadow"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">{noResultsLabel}</div>
          ) : filtered.map(i => (
            <button
              key={i._id}
              role="option"
              aria-selected={i._id === value}
              type="button"
              onClick={() => { onChange(i._id, i.label); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${i._id === value ? "bg-indigo-50" : ""}`}
            >
              {i.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateCase: React.FC<Props> = ({ open, onClose, doctors = [], patients = [], types = [] }) => {
  const dispatch: any = useDispatch();
  const [doctor, setDoctor]   = useState("");
  const [patient, setPatient] = useState("");
  const [type, setType]       = useState("");
  const [note, setNote]       = useState("");
  const [loading, setLoading] = useState(false);

  const [doctorModalOpen, setDoctorModalOpen]   = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);

  const patientsForDoctor = useMemo(() => {
    if (!doctor) return [] as PatientOption[];
    return (patients || []).filter((p: any) => {
      const d = p?.doctor;
      const did = typeof d === "string" ? d : d?._id;
      return did === doctor;
    });
  }, [patients, doctor]);

  const doctorValid  = !!doctor;
  const patientValid = !!patient;
  const typeValid    = !!type;
  const canSubmit    = doctorValid && patientValid && typeValid && !loading;

  if (!open) return null;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setLoading(true);
      const ok = await dispatch(createCase({ doctor, patient, type, note: note || undefined }));
      if (ok) {
        setDoctor("")
        setPatient("")
        setType("")
        setNote("")
        await dispatch(fetchCases());
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-500 text-white">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold">Ajouter un dossier</h2>
            {doctorValid && patientValid && typeValid && (
              <span className="inline-flex items-center gap-1 text-xs bg-white/15 backdrop-blur px-2 py-1 rounded-lg">
                <FiCheckCircle className="text-emerald-200" />
                <span className="font-medium">Résumé</span>
              </span>
            )}
          </div>
          {doctorValid && patientValid && typeValid && (
            <div className="mt-2 text-[13px] space-x-3 text-white/90">
              <span className="inline-flex items-center gap-1">
                <TbStethoscope className="opacity-90" /> {doctors.find(d => d._id === doctor)?.label}
              </span>
              <span className="inline-flex items-center gap-1">
                <FiUser className="opacity-90" /> {patients.find((p: any) => p._id === patient)?.label}
              </span>
              <span className="inline-flex items-center gap-1">
                <FiTag className="opacity-90" /> {types.find(t => t._id === type)?.label}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={onSave} className="max-h-[70vh] overflow-auto p-5 space-y-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">Médecin</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Combobox
                  id="doctor-combo"
                  value={doctor}
                  onChange={(id) => { setDoctor(id); setPatient(""); }}
                  items={doctors}
                  placeholder="Choisir un médecin…"
                  icon={<TbStethoscope />}
                />
              </div>
              <button
                type="button"
                onClick={() => setDoctorModalOpen(true)}
                className="h-11 px-3 rounded-xl border text-sm hover:bg-gray-50"
                title="Créer un nouveau médecin"
              >
                Nouveau
              </button>
            </div>
            {!doctorValid && <p className="mt-1 text-xs text-rose-600">Sélectionnez un médecin.</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">Patient</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Combobox
                  id="patient-combo"
                  value={patient}
                  onChange={(id) => setPatient(id)}
                  items={patientsForDoctor.map(p => ({ _id: p._id, label: p.label }))}
                  placeholder={doctor ? "Choisir un patient…" : "Choisissez d'abord un médecin"}
                  icon={<FiUser />}
                  disabled={!doctor}
                  noResultsLabel={doctor ? "Aucun patient pour ce médecin" : "Médecin requis"}
                />
              </div>
              <button
                type="button"
                onClick={() => doctor && setPatientModalOpen(true)}
                className="h-11 px-3 rounded-xl border text-sm hover:bg-gray-50 disabled:opacity-50"
                title={doctor ? "Créer un nouveau patient" : "Choisissez d'abord un médecin"}
                disabled={!doctor}
              >
                Nouveau
              </button>
            </div>
            {doctor && !patientValid && <p className="mt-1 text-xs text-rose-600">Sélectionnez un patient.</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">Type de mesure</label>
            <Combobox
              id="type-combo"
              value={type}
              onChange={(id) => setType(id)}
              items={types}
              placeholder="Choisir un type…"
              icon={<FiTag />}
            />
            {!typeValid && <p className="mt-1 text-xs text-rose-600">Sélectionnez un type.</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">Note (optionnel)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[90px] rounded-xl border px-3 py-2"
              placeholder="Informations complémentaires…"
            />
          </div>

          <div className="pt-2 border-t flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Création…" : "Créer"}
            </button>
          </div>
        </form>
      </div>

      <NewDoctorModal
        open={doctorModalOpen}
        onClose={() => setDoctorModalOpen(false)}
        onCreated={(doc: any) => {
          setDoctor(doc._id);
          setPatient("");
        }}
      />
      <NewPatientModal
        open={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        defaultDoctorId={doctor || undefined}
        onCreated={(pat: any) => {
          setPatient(pat._id);
        }}
      />
    </div>
  );
};

export default CreateCase;
