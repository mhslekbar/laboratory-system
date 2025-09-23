// src/components/cases/NewPatientModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { State } from "../../redux/store";
import { AddPatientApi, ShowPatientApi } from "../../redux/patients/PatientApiCalls";
import { ShowUserApi } from "../../redux/users/UserApiCalls";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (patient: { _id: string; label: string }) => void;
  defaultDoctorId?: string; // optionnel: pré-sélection
};

type Errors = {
  name?: string;
  phone?: string;
  doctor?: string;
};

const NewPatientModal: React.FC<Props> = ({ open, onClose, onCreated, defaultDoctorId }) => {
  const dispatch: any = useDispatch();
  const { patients } = useSelector((s: State) => (s as any).patients);
  const { users } = useSelector((s: State) => (s as any).users);

  // champs patient
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // médecin (searchable)
  const [doctorId, setDoctorId] = useState<string>(defaultDoctorId || "");
  const [docQuery, setDocQuery] = useState<string>("");
  const [docOpen, setDocOpen] = useState<boolean>(false);

  // validation
  const [errors, setErrors] = useState<Errors>({});
  const canSubmit =
    !errors.name &&
    !errors.phone &&
    !errors.doctor &&
    name.trim().length >= 2 &&
    !!doctorId;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Charger les médecins si pas déjà là
  useEffect(() => {
    if (!open) return;
    dispatch(ShowUserApi({ page: 1, limit: 1000, only: "doctors" }));
    // reset formulaire à l'ouverture
    setErrors({});
    setDocOpen(false);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, [open, dispatch]);

  // Pré-remplir l’input visible si on a un doctorId
  useEffect(() => {
    if (!doctorId) return;
    const opt = (users || [])
      .filter((u: any) => u?.doctor?.isDoctor)
      .find((u: any) => u?._id === doctorId);
    if (opt) setDocQuery(opt.fullName || opt.username || "");
  }, [users, doctorId]);

  // Options (médecins) et filtrage
  const doctorOptions = useMemo(() => {
    const docs = (users || []).filter((u: any) => u?.doctor?.isDoctor);
    return docs.map((u: any) => ({
      _id: u._id,
      label: u.fullName || u.username,
      sub: u?.doctor?.clinicName || u?.phone || "",
    }));
  }, [users]);

  const filteredDoctors = useMemo(() => {
    const q = docQuery.trim().toLowerCase();
    if (!q) return doctorOptions.slice(0, 20);
    return doctorOptions
      .filter(
        (d: any) =>
          d.label?.toLowerCase().includes(q) ||
          d.sub?.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [doctorOptions, docQuery]);

  // Fermer la liste quand on clique à l’extérieur
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setDocOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // --- Validation helpers ---
  const validateName = (v: string): string | undefined => {
    const trimmed = v.trim();
    if (trimmed.length === 0) return "Le nom est requis.";
    if (trimmed.length < 2) return "Le nom doit contenir au moins 2 caractères.";
    return undefined;
  };

  const validatePhone = (v: string): string | undefined => {
    if (!v) return undefined; // optionnel
    const ok = /^[+0-9()\-.\s]{6,}$/.test(v.trim());
    if (!ok) return "Format de téléphone invalide.";
    return undefined;
  };

  const validateDoctor = (id: string): string | undefined => {
    if (!id) return "Le médecin est requis.";
    return undefined;
  };

  const onNameChange = (v: string) => {
    setName(v);
    setErrors((e) => ({ ...e, name: validateName(v) }));
  };

  const onPhoneChange = (v: string) => {
    setPhone(v);
    setErrors((e) => ({ ...e, phone: validatePhone(v) }));
  };

  const onDocInputChange = (v: string) => {
    setDocQuery(v);
    setDoctorId(""); // reset tant qu’on n’a pas choisi
    setErrors((e) => ({ ...e, doctor: validateDoctor("") }));
  };

  // --- Submit ---
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validation finale
    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone);
    const doctorErr = validateDoctor(doctorId);
    const nextErrors: Errors = { name: nameErr, phone: phoneErr, doctor: doctorErr };
    setErrors(nextErrors);

    if (nameErr) {
      nameInputRef.current?.focus();
      return;
    }
    if (doctorErr) {
      setDocOpen(true);
      docInputRef.current?.focus();
      return;
    }

    // prêt — IMPORTANT: backend attend "doctor" (ObjectId)
    const payload: any = {
      name: name.trim(),
      phone: phone ? phone.trim() : undefined,
      doctor: doctorId, // ← FIX (et non "doctorId")
    };

    const ok = await dispatch(AddPatientApi(payload));
    if (ok) {
      await dispatch(ShowPatientApi({ page: 1, limit: 1000 }));
      // retrouver le patient fraîchement créé (heuristique simple)
      const created = (patients || []).find(
        (p: any) => p?.name?.trim() === name.trim() && (!phone || p?.phone === phone.trim())
      );
      if (created) {
        onCreated?.({ _id: created._id, label: created.name });
      }
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold">Nouveau patient</h3>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4" noValidate>
          <div className="grid gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">
                Nom <span className="text-rose-600">*</span>
              </label>
              <input
                ref={nameInputRef}
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className={`h-11 rounded-xl border px-3 ${errors.name ? "border-rose-500 focus:ring-rose-500" : ""}`}
                placeholder="ex. Mohamed Ali"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "err-name" : undefined}
                required
              />
              {errors.name && (
                <p id="err-name" className="mt-1 text-xs text-rose-600">{errors.name}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Téléphone (optionnel)</label>
              <input
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                className={`h-11 rounded-xl border px-3 ${errors.phone ? "border-rose-500 focus:ring-rose-500" : ""}`}
                placeholder="+212 ..."
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "err-phone" : undefined}
              />
              {errors.phone && (
                <p id="err-phone" className="mt-1 text-xs text-rose-600">{errors.phone}</p>
              )}
            </div>

            {/* Select searchable de médecins (OBLIGATOIRE) */}
            <div className="flex flex-col" ref={wrapperRef}>
              <label className="text-xs font-medium mb-1">
                Médecin <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  ref={docInputRef}
                  value={docQuery}
                  onChange={(e) => onDocInputChange(e.target.value)}
                  onFocus={() => {
                    setDocOpen(true);
                    setErrors((e) => ({ ...e, doctor: validateDoctor(doctorId) }));
                  }}
                  placeholder="Rechercher un médecin (nom, clinique, téléphone)"
                  className={`h-11 w-full rounded-xl border px-3 pr-9 outline-none focus:ring-2 ${
                    errors.doctor ? "border-rose-500 focus:ring-rose-500" : "focus:ring-indigo-500"
                  }`}
                  aria-invalid={!!errors.doctor}
                  aria-describedby={errors.doctor ? "err-doctor" : undefined}
                  required
                />
                {/* Clear / toggle */}
                {docQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDocQuery("");
                      setDoctorId("");
                      setDocOpen(true);
                      setErrors((e) => ({ ...e, doctor: "Le médecin est requis." }));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                    title="Effacer"
                    aria-label="Effacer"
                  >
                    ×
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDocOpen((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                    title="Afficher la liste"
                    aria-label="Afficher la liste"
                  >
                    ▼
                  </button>
                )}
                {docOpen && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-xl border bg-white shadow">
                    {filteredDoctors.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>
                    ) : (
                      filteredDoctors.map((d: any) => {
                        const selected = d._id === doctorId;
                        return (
                          <button
                            key={d._id}
                            type="button"
                            onClick={() => {
                              setDoctorId(d._id);
                              setDocQuery(d.label);
                              setDocOpen(false);
                              setErrors((e) => ({ ...e, doctor: undefined }));
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                              selected ? "bg-indigo-50" : ""
                            }`}
                          >
                            <div className="font-medium">{d.label}</div>
                            {d.sub ? <div className="text-xs text-gray-500">{d.sub}</div> : null}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              {errors.doctor && (
                <p id="err-doctor" className="mt-1 text-xs text-rose-600">{errors.doctor}</p>
              )}
              {doctorId && !errors.doctor ? (
                <div className="mt-1 text-xs text-emerald-700">Médecin sélectionné ✔</div>
              ) : null}
            </div>
          </div>

          <div className="pt-2 border-t flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              Créer le patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPatientModal;
