import React, { useContext, useEffect, useState } from "react";
import InputsAddUser from "./forms/InputsAddUser";
import { AddUserContext, UserInterface } from "./types";
import { bindActionCreators } from "redux";
import { EditUserApi } from "../../redux/users/UserApiCalls";
import { useDispatch } from "react-redux";
import { Timeout } from "../../functions/functions";
import { ShowUserContext } from "./ShowUsers";
import { PermissionType } from "../roles/types";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";

interface EditUserInterface {
  modal: boolean;
  toggle: () => void;
  user: UserInterface;
}

const EditUser: React.FC<EditUserInterface> = ({ modal, toggle, user }) => {
  const [fullName, setFullName] = useState<string>(user.fullName || (user as any)?.name || "");
  const [username, setUsername] = useState<string>(user.username || "");
  const [phone, setPhone] = useState<string>(user.phone || "");
  const [password, setPassword] = useState<string>("");

  const [isDoctor, setIsDoctor] = useState<boolean>(!!user?.doctor?.isDoctor);
  const [clinicName, setClinicName] = useState<string>(user?.doctor?.clinicName || "");
  const [checkedRoles, setCheckedRoles] = useState<PermissionType[]>(((user as any)?.roles || []) as PermissionType[]);

  const { setSuccessMsg } = useContext(ShowUserContext);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    setFullName(user.fullName || (user as any)?.name || "");
    setUsername(user.username || "");
    setPhone(user.phone || "");
    setPassword("");
    setCheckedRoles(((user as any)?.roles || []) as PermissionType[]);
    setIsDoctor(!!user?.doctor?.isDoctor);
    setClinicName(user?.doctor?.clinicName || "");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const data: any = {
      fullName: fullName?.trim(),
      username: username?.trim(),
      phone: phone?.trim(),
      roles: checkedRoles.map((role: any) => role?._id ?? role),
      doctor: isDoctor
        ? { isDoctor: true, clinicName: clinicName?.trim() || undefined }
        : { isDoctor: false },
    };
    if (password && password.trim().length > 0) data.password = password;

    setLoading(true);
    setErrors([]);
    try {
      const boundActions = bindActionCreators({ EditUserApi }, dispatch as any);
      const response = await boundActions.EditUserApi(user._id, data);
      if (typeof response === "boolean") {
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

  if (!modal) return null;

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
            <h2 className="text-lg font-semibold">Modifier l’utilisateur</h2>
            <p className="text-xs opacity-90">{user?.username || user?.fullName || "—"}</p>
          </div>

          {/* Body scrollable */}
          <div className="max-h-[80vh] overflow-y-auto p-5">
            <ShowErrorMsg errors={errors} setErrors={setErrors} />
            <form id="edit-user-form" className="space-y-5" onSubmit={handleSubmit}>
              <InputsAddUser />
            </form>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
            <button onClick={toggle} className="h-10 px-4 rounded-xl border text-sm hover:bg-gray-50">Annuler</button>
            <button form="edit-user-form" type="submit" disabled={loading} className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60">
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </AddUserContext.Provider>
  );
};

export default EditUser;
