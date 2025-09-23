import React, { useContext, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { addRoleApi } from "../../redux/roles/roleApiCalls";
import { useDispatch } from "react-redux";
import { ShowRoleContext } from "./ShowRoles";
import { Timeout } from "../../functions/functions";
import { useTranslation } from "react-i18next";
import ShowErrorMsg from "../../HtmlComponents/ShowErrorMsg";
import { InputElement } from "../../HtmlComponents/InputElement";
import Modal from "./Modal";

const AddRole: React.FC = () => {
  const [role, setRole] = useState<string>("");
  const [modal, setModal] = useState<boolean>(false);
  const dispatch: any = useDispatch();
  const { setShowSuccessMsg } = useContext(ShowRoleContext);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  const toggle = () => setModal((s) => !s);

  const handleAddNewRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await dispatch(addRoleApi({ name: role.trim() }));
      if (typeof response === "boolean") {
        setShowSuccessMsg(true);
        toggle();
        setTimeout(() => setShowSuccessMsg(false), Timeout);
        setRole("");
        setErrors([]);
      } else if (Array.isArray(response)) {
        setErrors(response);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition" onClick={toggle}>
        <span className="inline-flex items-center gap-2">
          <FaPlus />
          {t("Ajouter")}
        </span>
      </button>

      <Modal
        open={modal}
        onClose={toggle}
        title={t("Ajouter un rôle")}
        size="sm"
        initialFocusId="role-name-input"
      >
        <form onSubmit={handleAddNewRole} className="space-y-3">
          <ShowErrorMsg errors={errors} setErrors={setErrors} />
          <InputElement
            name={t("Role") as string}
            value={role}
            setValue={setRole}
            id="role-name-input"
          />

          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" className="rounded-lg px-4 py-2 hover:bg-gray-100" onClick={toggle}>
              {t("Annuler")}
            </button>
            <button
              type="submit"
              disabled={loading || !role.trim()}
              className={`rounded-lg px-4 py-2 text-white transition ${loading || !role.trim() ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              {loading ? t("Enregistrement…") : t("Ajouter")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddRole;
