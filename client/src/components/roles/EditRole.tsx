import React, { useContext, useState } from "react";
import { Timeout } from "../../functions/functions";
import { RoleType as RoleDoc } from "./types";
import { editRoleApi } from "../../redux/roles/roleApiCalls";
import { useDispatch } from "react-redux";
import { ShowRoleContext } from "./ShowRoles";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";
import { useTranslation } from "react-i18next";
import { InputElement } from "../../HtmlComponents/InputElement";
import Modal from "./Modal";

interface EditRoleInterface {
  modal: boolean;
  toggle: () => void;
  roleData: RoleDoc;
}

const EditRole: React.FC<EditRoleInterface> = ({ modal, toggle, roleData }) => {
  const [role, setRole] = useState<string>(roleData.name);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch: any = useDispatch();
  const { setShowSuccessMsg } = useContext(ShowRoleContext);
  const { t } = useTranslation();

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response: any = await dispatch(editRoleApi(roleData._id, { name: role.trim() }));
      if (response === true) {
        setShowSuccessMsg(true);
        toggle();
        setTimeout(() => setShowSuccessMsg(false), Timeout);
        setErrors([]);
      } else if (Array.isArray(response)) {
        setErrors(response);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={modal}
      onClose={toggle}
      title={t("Modifier le rôle")}
      size="sm"
      initialFocusId="role-edit-input"
    >
      <form onSubmit={handleEditRole} className="space-y-3">
        <ShowErrorMsg errors={errors} setErrors={setErrors} />
        <InputElement name={t("Role") as string} value={role} setValue={setRole} id="role-edit-input" />

        <div className="flex items-center justify-end gap-3 pt-1">
          <button type="button" className="rounded-lg px-4 py-2 hover:bg-gray-100" onClick={toggle}>
            {t("Annuler")}
          </button>
          <button
            type="submit"
            disabled={loading || !role.trim() || role.trim() === roleData.name}
            className={`rounded-lg px-4 py-2 text-white transition ${
              loading || !role.trim() || role.trim() === roleData.name
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? t("Enregistrement…") : t("Modifier")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditRole;
