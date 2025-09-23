import React, { useContext, useMemo } from "react";
import { PermissionType } from "../types";
import { RolePermissionsContext } from "./RolePermissionsContext";

interface SelectedPermissionInterface {
  permission: PermissionType;
  roleId: string;
}

const SelectedPermission: React.FC<SelectedPermissionInterface> = ({ permission, roleId }) => {
  const { selectedIds, setSelectedIds } = useContext(RolePermissionsContext);
  const id = useMemo(() => `role-permis${roleId}${permission._id}`, [roleId, permission._id]);
  const checked = selectedIds.has(permission._id);

  const toggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = new Set(selectedIds);
    if (e.target.checked) next.add(permission._id);
    else next.delete(permission._id);
    setSelectedIds(next);
  };

  return (
    <input
      type="checkbox"
      id={id}
      className="mr-2 accent-indigo-600"
      checked={checked}
      onChange={toggle}
      value={permission._id}
    />
  );
};

export default SelectedPermission;
