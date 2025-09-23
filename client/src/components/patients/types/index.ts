// src/components/patients/types.ts
import React, { createContext } from "react";

export interface DoctorLite {
  _id: string;
  fullName?: string;
  username?: string;
}

export interface PatientInterface {
  _id: string;
  name: string;
  phone?: string;
  dob?: Date | string | null;
  notes?: string;
  doctor?: DoctorLite | string | null; // <— ajouté
}

/* ----------------- ShowPatients Context ----------------- */
export type ShowPatientType = {
  successMsg: boolean;
  setSuccessMsg: React.Dispatch<React.SetStateAction<boolean>>;

  showEditModal: boolean;
  setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;

  showDeleteModal: boolean;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;

  selectedPatient: PatientInterface;
  setSelectedPatient: React.Dispatch<React.SetStateAction<PatientInterface>>;
};

export const DefaultPatientInterface: PatientInterface = {
  _id: "",
  name: "",
  phone: "",
  dob: new Date(),
  notes: "",
  doctor: null,
};

const noop = () => {};

export const DefaultShowPatientType: ShowPatientType = {
  successMsg: false,
  setSuccessMsg: noop as any,
  showEditModal: false,
  setShowEditModal: noop as any,
  showDeleteModal: false,
  setShowDeleteModal: noop as any,
  selectedPatient: DefaultPatientInterface,
  setSelectedPatient: noop as any,
};

/** <— CONTEXTE DU FORMULAIRE : on ajoute doctorId */
export const AddPatientContext = createContext<{
  name: string; setName: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  dob: string; setDob: (v: string) => void;
  notes: string; setNotes: (v: string) => void;

  doctorId?: string; setDoctorId?: (v: string) => void; // <— ajouté
}>({
  name: "", setName: noop,
  phone: "", setPhone: noop,
  dob: "", setDob: noop,
  notes: "", setNotes: noop,

  doctorId: "", setDoctorId: noop, // <— défauts sûrs
});

export const toInputDate = (d?: Date | string | null): string => {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
