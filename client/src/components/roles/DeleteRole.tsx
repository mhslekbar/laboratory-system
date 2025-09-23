import React, { useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { RoleType as RoleDoc } from "./types";
import { deleteRoleApi } from "../../redux/roles/roleApiCalls";
import { Timeout } from "../../functions/functions";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";
import { ShowRoleContext } from "./ShowRoles";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";

interface DeleteRoleInterface {
  modal: boolean;
  toggle: () => void;
  roleData: RoleDoc;
}

const DeleteRole: React.FC<DeleteRoleInterface> = ({ modal, toggle, roleData }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { setShowSuccessMsg } = useContext(ShowRoleContext);
  const { t } = useTranslation();

  const handleDeleteRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const boundApi = bindActionCreators({ deleteRoleApi }, dispatch);
      const response = await boundApi.deleteRoleApi(roleData._id);
      if (typeof response === "boolean") {
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
      title={t("Supprimer le rôle")}
      size="sm"
      danger
    >
      <form onSubmit={handleDeleteRole} className="space-y-3">
        <ShowErrorMsg errors={errors} setErrors={setErrors} />

        <div className="text-sm">
          <p>
            {t("Êtes-vous sûr de vouloir supprimer ce rôle")}{" "}
            <span className="font-semibold">{roleData?.name}</span> ?
          </p>
          <p className="mt-1 text-rose-600">
            {t("Cette action est irréversible.")}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button type="button" className="rounded-lg px-4 py-2 hover:bg-gray-100" onClick={toggle}>
            {t("Annuler")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-white transition ${
              loading ? "bg-rose-300 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {loading ? t("Suppression…") : t("Supprimer")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DeleteRole;
