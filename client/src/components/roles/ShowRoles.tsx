import React, { createContext, useEffect, useMemo, useState } from "react";
import AddRole from "./AddRole";
import SuccessMsg from "../../Messages/SuccessMsg";
import { useSelector, useDispatch } from "react-redux";
import { State } from "../../redux/store";
import ButtonControls from "./controls/ButtonControls";
import {
  DefaultRoleType,
  RoleType as RoleDoc, // avoid name clash with redux actions enums
  ShowRoleType,
  defaultShowRoleTypeValue,
} from "./types";
import { showRolesApi } from "../../redux/roles/roleApiCalls";
import { FaEye, FaSearch } from "react-icons/fa";
import RoleByPermission from "./permissions/RoleByPermission";
import { useTranslation } from "react-i18next";

export const ShowRoleContext = createContext<ShowRoleType>(defaultShowRoleTypeValue);

const ShowRoles: React.FC = () => {
  const [showSuccessMsg, setShowSuccessMsg] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<RoleDoc>(DefaultRoleType as RoleDoc);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const { roles }: { roles: RoleDoc[] } = useSelector((state: State) => state.roles);

  const dispatch: any = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(showRolesApi());
  }, [dispatch]);

  const toggleExpand = (roleId: string, role?: RoleDoc) => {
    setSelectedRole(role || (DefaultRoleType as RoleDoc));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(roleId) ? next.delete(roleId) : next.add(roleId);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const norm = (s: string) => s?.toLowerCase()?.trim();
    if (!q) return roles;
    return roles.filter((r) => norm(t(r.name)).includes(norm(q)));
  }, [roles, q, t]);

  return (
    <div className="space-y-3">
      <ShowRoleContext.Provider
        value={{
          showSuccessMsg,
          setShowSuccessMsg,
          selectedRole,
          setSelectedRole,
        }}
      >
        {showSuccessMsg && (
          <SuccessMsg
            modal={showSuccessMsg}
            toggle={() => setShowSuccessMsg(!showSuccessMsg)}
          />
        )}

        {/* Header actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Rechercher un rôle") as string}
              className="w-full pl-9 pr-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <AddRole />
        </div>

        {/* Quick stats */}
        <div className="text-sm opacity-70">
          {t("Total des rôles")}: {roles?.length || 0}
        </div>

        {/* Grid */}
        <div className="grid xs:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered?.map((role) => {
            const open = expandedIds.has(role._id);
            return (
              <article
                key={role._id}
                className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <header className="flex items-center gap-3 p-3 border-b">
                  <ButtonControls role={role as any} />
                  <button
                    className="text-left flex-1 font-medium hover:opacity-80"
                    onClick={() => toggleExpand(role._id, role)}
                    aria-expanded={open}
                  >
                    {t(role.name)}
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100"
                    onClick={() => toggleExpand(role._id, role)}
                    aria-label={open ? (t("Masquer") as string) : (t("Afficher") as string)}
                  >
                    <FaEye className={`text-indigo-600 ${open ? "opacity-100" : "opacity-70"}`} />
                  </button>
                </header>

                <div className={`${open ? "block" : "hidden"} p-3`}>
                  <RoleByPermission role={role as any} />
                </div>
              </article>
            );
          })}
        </div>
      </ShowRoleContext.Provider>
    </div>
  );
};

export default ShowRoles;
