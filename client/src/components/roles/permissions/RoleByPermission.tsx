import React, { useEffect, useMemo, useState } from "react";
import { get } from "../../../requestMethods";
import {
  RoleByPermissionType,
  DefaultRoleByPermission,
  RoleType as RoleDoc,
} from "../types";
import ListPermission from "./ListPermission";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { RolePermissionsContext } from "./RolePermissionsContext";
import SavePermissions from "../SavePermissions";

interface RoleByPermissionInterface {
  role: RoleDoc;
}

const RoleByPermission: React.FC<RoleByPermissionInterface> = ({ role }) => {
  const [roleAndPermission, setRoleAndPermission] =
    useState<RoleByPermissionType>(DefaultRoleByPermission);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set()); // accordion
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set((role.permissions as any[])?.map((p: any) => p._id?.toString()))
  );
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const response = await get("permission/byTable");
        const resData = response?.data?.success;
        if (resData) setRoleAndPermission(resData);
      } catch {}
    })();
  }, []);

  // keep in sync when role changes (switching card)
  useEffect(() => {
    setSelectedIds(new Set((role.permissions as any[])?.map((p: any) => p._id?.toString())));
  }, [role._id, role.permissions]);

  const sorted = useMemo(
    () => [...(roleAndPermission || [])].sort((a, b) => a._id?.localeCompare(b._id)),
    [roleAndPermission]
  );

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ------- Global select all -------
  const allPermissionIds = useMemo(
    () => new Set(sorted.flatMap((g) => (g.data || []).map((p) => p._id))),
    [sorted]
  );

 const isAllSelected = useMemo(
   () =>
     allPermissionIds.size > 0 &&
     Array.from(allPermissionIds).every((id) => selectedIds.has(id)),
   [allPermissionIds, selectedIds]
 );
  const toggleAll = () => {
    setSelectedIds((prev) => {
      if (isAllSelected) return new Set<string>();
      return new Set<string>(allPermissionIds);
    });
  };

  return (
    <RolePermissionsContext.Provider value={{ selectedIds, setSelectedIds }}>
      {/* Global controls */}
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-indigo-600"
            checked={isAllSelected}
            onChange={toggleAll}
          />
          <span className="font-medium">{t("Tout sélectionner")}</span>
        </label>

        <span className="text-sm opacity-70">
          {t("Sélectionnées")}: {selectedIds.size}
        </span>
      </div>

      <div className="space-y-2">
        {sorted.map((collection) => {
          const isOpen = openGroups.has(collection._id);

          // per-group select all
          const groupIds = new Set((collection.data || []).map((p) => p._id));
          const isGroupAllSelected = Array.from(groupIds).every((id) => selectedIds.has(id));

          const toggleGroupAll = (e: React.ChangeEvent<HTMLInputElement>) => {
            const checked = e.target.checked;
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (checked) {
                groupIds.forEach((id) => next.add(id));
              } else {
                groupIds.forEach((id) => next.delete(id));
              }
              return next;
            });
          };

          return (
            <section key={collection._id} className="rounded-xl border bg-gray-50">
              <div className="flex items-center justify-between px-4 py-2">
                <button
                  onClick={() => toggleGroup(collection._id)}
                  className="flex-1 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium">{t(collection._id)}</span>
                </button>

                {/* group select all */}
                <label className="mr-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-indigo-600"
                    checked={isGroupAllSelected}
                    onChange={toggleGroupAll}
                  />
                  {t("Tout")}
                </label>

                <span className="text-indigo-600">{isOpen ? <FaMinus /> : <FaPlus />}</span>
              </div>

              <div className={`${isOpen ? "block" : "hidden"} px-4 pb-3`}>
                <ListPermission collectionName={collection as any} role={role as any} />
              </div>
            </section>
          );
        })}
      </div>

      {/* Save bar lives within provider so it reads selectedIds */}
      <div className="pt-3 border-t mt-3">
        <SavePermissions role={role as any} />
      </div>
    </RolePermissionsContext.Provider>
  );
};

export default RoleByPermission;
