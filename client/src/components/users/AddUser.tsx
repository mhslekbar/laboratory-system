import React, { useContext, useState } from "react";
import InputsAddUser from "./forms/InputsAddUser";
import { AddUserContext } from "./types";
import { AddUserApi } from "../../redux/users/UserApiCalls";
import { useDispatch } from "react-redux";
import { Timeout } from "../../functions/functions";
import { ShowUserContext } from "./ShowUsers";
import { PermissionType } from "../roles/types";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const AddUser: React.FC<Props> = ({ open, setOpen }) => {
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isDoctor, setIsDoctor] = useState<boolean>(false);
  const [clinicName, setClinicName] = useState<string>("");

  const [checkedRoles, setCheckedRoles] = useState<PermissionType[]>([]);

  const toggle = () => setOpen(!open);

  const { setSuccessMsg } = useContext(ShowUserContext);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch: any = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const data = {
      fullName: fullName?.trim(),
      username: username?.trim(),
      phone: phone?.trim(),
      password,
      roles: checkedRoles.map((role: any) => role._id),
      doctor: isDoctor
        ? { isDoctor: true, clinicName: clinicName?.trim() || undefined }
        : { isDoctor: false },
    };

    setLoading(true);
    setErrors([]);
    try {
      const response = await dispatch(AddUserApi(data));
      if (typeof response === "boolean") {
        setUsername(""); setFullName(""); setPhone(""); setPassword("");
        setCheckedRoles([]); setIsDoctor(false); setClinicName("");
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), Timeout);
        toggle();
      } else if (Array.isArray(response)) {
        setErrors(response);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AddUserContext.Provider
      value={{
        fullName, setFullName,
        username, setUsername,
        phone, setPhone,
        password, setPassword,
        checkedRoles, setCheckedRoles,
        isDoctor, setIsDoctor,
        clinicName, setClinicName,
      }}
    >
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3" role="dialog" aria-modal="true" onClick={toggle}>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-500 text-white">
            <h2 className="text-lg font-semibold">Nouvel utilisateur</h2>
            <p className="text-xs opacity-90">Renseignez les informations de l’utilisateur.</p>
          </div>

          {/* Body scrollable */}
          <div className="max-h-[80vh] overflow-y-auto p-5">
            <ShowErrorMsg errors={errors} setErrors={setErrors} />
            <form id="add-user-form" className="space-y-5" onSubmit={handleSubmit}>
              <InputsAddUser />
            </form>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
            <button onClick={toggle} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">Annuler</button>
            <button form="add-user-form" type="submit" disabled={loading} className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60">
              {loading ? "Enregistrement…" : "Ajouter"}
            </button>
          </div>
        </div>
      </div>
    </AddUserContext.Provider>
  );
};

export default AddUser;
