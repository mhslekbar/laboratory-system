import React, { useContext, useMemo, useState } from "react";
import { RoleType as RoleDoc } from "./types";
import { useDispatch } from "react-redux";
import { editRoleApi } from "../../redux/roles/roleApiCalls";
import { ShowRoleContext } from "./ShowRoles";
import { Timeout } from "../../functions/functions";
import { useTranslation } from "react-i18next";
import { RolePermissionsContext } from "./permissions/RolePermissionsContext";

interface SavePermissionsInterface {
  role: RoleDoc;
}

const SavePermissions: React.FC<SavePermissionsInterface> = ({ role }) => {
  const dispatch: any = useDispatch();
  const { setShowSuccessMsg } = useContext(ShowRoleContext);
  const { selectedIds } = useContext(RolePermissionsContext);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const selectedList = useMemo(() => Array.from(selectedIds), [selectedIds]);
  const initialIds = useMemo(
    () => new Set((role.permissions as any[])?.map((p: any) => p._id?.toString())),
    [role.permissions]
  );
  const changed =
    selectedList.length !== initialIds.size ||
    selectedList.some((id) => !initialIds.has(id));

  const handleSavePermission = async () => {
    setLoading(true);
    try {
      const response = await dispatch(editRoleApi(role._id, { permissions: selectedList }));
      if (response === true) {
        setShowSuccessMsg(true);
        setTimeout(() => setShowSuccessMsg(false), Timeout);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <span className="text-sm opacity-70">
        {t("Sélectionnées")}: {selectedList.length}
      </span>
      <button
        className={`rounded-lg px-4 py-2 text-white transition ${
          changed ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={!changed || loading}
        onClick={handleSavePermission}
      >
        {loading ? t("Enregistrement…") : t("Enregistrer")}
      </button>
    </div>
  );
};

export default SavePermissions;
