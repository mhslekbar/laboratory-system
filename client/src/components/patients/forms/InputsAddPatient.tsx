// src/components/patients/forms/InputsAddPatient.tsx
import React, { useContext, useEffect, useRef } from "react";
import { AddPatientContext } from "../types";
import { useTranslation } from "react-i18next";
import DoctorAutoComplete from "../DoctorAutoComplete"; // <— ton autocomplete

type Props = {
  showDoctor?: boolean; // permet de masquer le champ docteur pour les rôles médecin
};

const InputsAddPatient: React.FC<Props> = ({ showDoctor = true }) => {
  const {
    name, setName,
    phone, setPhone,
    dob, setDob,
    notes, setNotes,
    doctorId, setDoctorId,
  } = useContext(AddPatientContext);

  const { t } = useTranslation();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // focus sur le nom à l’ouverture
    nameRef.current?.focus();
  }, []);

  return (
    <div className="space-y-5">
      {/* Ligne 1 : Médecin (optionnel, seulement admin/gerant) */}
      {showDoctor && (
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">
            {t("Médecin assigné")} <span className="text-rose-600">*</span>
          </label>
          <DoctorAutoComplete
            value={doctorId || ""}
            onChange={(value) => setDoctorId && setDoctorId(value)}
            placeholder={t("Rechercher un médecin…") as string}
            className="w-full"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            {t("Sélectionnez le médecin responsable du patient.")}
          </p>
        </div>
      )}

      {/* Ligne 2 : Nom / Téléphone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">
            {t("Nom")} <span className="text-rose-600">*</span>
          </label>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t("Nom complet") as string}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">{t("Téléphone")}</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t("Numéro de téléphone") as string}
          />
          <p className="mt-1 text-[11px] text-gray-500">
            {t("Format libre — ex: +222 12 34 56 78")}
          </p>
        </div>
      </div>

      {/* Ligne 3 : Date de naissance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1">{t("Date de Naissance")}</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Ligne 4 : Notes */}
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">{t("Notes")}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[96px] rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={t("Observations, allergies, préférences…") as string}
        />
      </div>
    </div>
  );
};

export default InputsAddPatient;
