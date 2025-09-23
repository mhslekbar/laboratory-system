// src/components/cases/NewDoctorModal.tsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../redux/store";
import { AddUserApi, ShowUserApi } from "../../redux/users/UserApiCalls";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (doctor: { _id: string; label: string }) => void;
};

const NewDoctorModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const dispatch: any = useDispatch();
  const { users } = useSelector((s: State) => (s as any).users);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const canSubmit = fullName.trim() !== "" && username.trim() !== "";

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      const ok = await dispatch(
        AddUserApi({
          fullName,
          username,
          phone,
          doctor: { isDoctor: true, clinicName, phone },
        })
      );

      if (ok) {
        await dispatch(ShowUserApi({ page: 1, limit: 1000, only: "all" }));
        const created = (users || []).find((u: any) => u?.username === username);
        if (created) {
          onCreated?.({
            _id: created._id,
            label: created.fullName || created.username,
          });
        }
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold">Nouveau médecin</h3>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Nom complet</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 rounded-xl border px-3"
                placeholder="ex. Dr Ahmed"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Nom d’utilisateur</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 rounded-xl border px-3"
                placeholder="unique"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Clinique</label>
              <input
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="h-11 rounded-xl border px-3"
                placeholder="Nom de la clinique"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Téléphone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl border px-3"
                placeholder="+212 ..."
              />
            </div>
          </div>

          <div className="pt-2 border-t flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Création…" : "Créer le médecin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDoctorModal;
