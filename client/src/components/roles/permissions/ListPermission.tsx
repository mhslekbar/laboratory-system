import React, { useEffect, useState } from "react";
import SelectedPermission from "./SelectedPermission";
import { SingleRoleByPermissionType, RoleType as RoleDoc, PermissionType } from "../types";
import { useSelector, useDispatch } from "react-redux";
import { State } from "../../../redux/store";
import { ShowPermissionApi } from "../../../redux/permissions/permissionApiCalls";
import { useTranslation } from "react-i18next";

interface ListPermissionInterface {
  collectionName: SingleRoleByPermissionType;
  role: RoleDoc;
}

const ListPermission: React.FC<ListPermissionInterface> = ({ collectionName, role }) => {
  const { permissions }: { permissions: PermissionType[] } = useSelector((state: State) => state.permissions);
  const [allowedPermission, setAllowedPermissions] = useState<PermissionType[]>([]);
  const dispatch: any = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(ShowPermissionApi());
  }, [dispatch]);

  useEffect(() => {
    setAllowedPermissions(permissions?.filter((p) => p.collectionName === collectionName._id));
  }, [collectionName._id, permissions]);

  return (
    <div className="space-y-2">
      {allowedPermission.map((permission) => (
        <label
          key={permission._id}
          htmlFor={`role-permis${role._id}${permission._id}`}
          className="flex items-center"
        >
          <SelectedPermission permission={permission} roleId={role._id} />
          <span>{t(permission.name)}</span>
        </label>
      ))}
    </div>
  );
};

export default ListPermission;
