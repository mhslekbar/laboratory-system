// src/components/users/TableUsers.tsx
import React, { useContext } from "react";
import { UserInterface } from "./types";
import { FaEdit } from "react-icons/fa";
import { MdRemoveCircle } from "react-icons/md";
import { ShowUserContext } from "./ShowUsers";
import { useTranslation } from "react-i18next";

interface TableUsersInterface {
  users: UserInterface[];
  canManage?: boolean;
  view?: "all" | "users" | "doctors";
}

const initialsOf = (s?: string) => (s?.trim()?.[0]?.toUpperCase() ?? "U");
const safe = (v?: string) => (v && v.trim().length ? v : "—");

const ActiveDot: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={`inline-block h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-gray-300"}`}
    aria-hidden="true"
    title={active ? "Actif" : "Inactif"}
  />
);

const RoleChip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-900/30 dark:text-indigo-200">
    {children}
  </span>
);

const TagPill: React.FC<{ tone?: "ok" | "muted"; children: React.ReactNode }> = ({ tone = "ok", children }) => (
  <span
    className={[
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      tone === "ok"
        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200"
        : "border border-gray-300 bg-white text-gray-600",
    ].join(" ")}
  >
    {children}
  </span>
);

const IconBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = "", ...props }) => (
  <button
    {...props}
    className={
      "p-2 rounded-lg ring-1 ring-transparent transition " +
      "hover:bg-gray-50 hover:ring-gray-200 focus:outline-none focus:ring-2 " +
      className
    }
  />
);

const TableUsers: React.FC<TableUsersInterface> = ({ users, canManage = true, view = "all" }) => {
  const { setShowEditModal, setSelectedUser, setShowDeleteModal } = useContext(ShowUserContext);
  const { t } = useTranslation();

  const openEditUser = (user: UserInterface) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };
  const openDeleteUser = (user: UserInterface) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Filtre de base (exclure comptes dev)
  const data = (users || []).filter((u: any) => !u?.dev);
  const isDoctorsView = view === "doctors";

  return (
    <>
      {/* Desktop / Tablet */}
      <div className="hidden sm:block rounded-2xl border shadow-sm overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center">
                <th className="px-4 py-3 text-left font-medium">{t("Nom")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("Téléphone")}</th>
                <th className="px-4 py-3 text-left font-medium">
                  {isDoctorsView ? t("Médecin") : t("Rôles")}
                </th>
                {canManage && <th className="px-4 py-3 text-center font-medium">{t("Actions")}</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white dark:divide-neutral-800">
              {data.length ? (
                data.map((user: any, index: number) => {
                  const name = user?.fullName || user?.username;
                  const isDoctor = !!user?.doctor?.isDoctor;
                  const clinic = user?.doctor?.clinicName;
                  const email = user?.email;
                  const phone = user?.phone;
                  return (
                    <tr
                      key={user?._id ?? index}
                      className="bg-white even:bg-gray-50 hover:bg-gray-100/70 transition-colors dark:bg-neutral-900 dark:even:bg-neutral-950 dark:hover:bg-neutral-800"
                    >
                      {/* Nom + avatar + email + actif */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white grid place-content-center text-xs font-bold"
                            aria-hidden="true"
                          >
                            {initialsOf(name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-medium truncate max-w-[260px]" title={name}>
                                {safe(name)}
                              </div>
                              <ActiveDot active={!!user?.active} />
                            </div>
                            {email ? (
                              <div className="text-xs text-gray-500 truncate max-w-[260px]" title={email}>
                                {email}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Téléphone */}
                      <td className="px-4 py-3">
                        <span title={phone}>{safe(phone)}</span>
                      </td>

                      {/* Colonne dynamique */}
                      <td className="px-4 py-3">
                        {isDoctorsView ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <TagPill tone={isDoctor ? "ok" : "muted"}>
                              {isDoctor ? t("Médecin") : t("Non médecin")}
                            </TagPill>
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              {clinic ? `${t("Clinique")}: ${clinic}` : "—"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {(user?.roles || []).length ? (
                              (user.roles || []).map((role: any, i: number) => (
                                <RoleChip key={role?._id ?? i}>{role?.name ?? "—"}</RoleChip>
                              ))
                            ) : (
                              <>—</>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      {canManage && (
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <IconBtn
                              type="button"
                              onClick={() => openEditUser(user)}
                              className="hover:ring-indigo-200 focus:ring-indigo-500"
                              aria-label={t("Modifier l'utilisateur") as string}
                              title={t("Modifier l'utilisateur") as string}
                            >
                              <FaEdit className="text-indigo-600 text-[18px]" />
                            </IconBtn>

                            <IconBtn
                              type="button"
                              onClick={() => openDeleteUser(user)}
                              className="hover:ring-rose-200 focus:ring-rose-500"
                              aria-label={t("Supprimer l'utilisateur") as string}
                              title={t("Supprimer l'utilisateur") as string}
                            >
                              <MdRemoveCircle className="text-rose-600 text-[20px]" />
                            </IconBtn>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={canManage ? 4 : 3} className="px-4 py-10 text-center">
                    <div className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-gray-500 bg-gray-50">
                      <span className="text-sm">{t("Aucun utilisateur trouvé")}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-3">
        {data.length === 0 && (
          <div className="rounded-2xl border p-4 text-center text-gray-500 text-sm bg-white">
            {t("Aucun utilisateur trouvé")}
          </div>
        )}

        {data.map((u: any, i: number) => {
          const name = u?.fullName || u?.username;
          const isDoctor = !!u?.doctor?.isDoctor;
          const clinic = u?.doctor?.clinicName;
          return (
            <div key={u?._id ?? i} className="rounded-2xl border p-4 shadow-sm bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">{t("Nom")}</div>
                  <div className="font-medium break-words flex items-center gap-2">
                    {safe(name)}
                    <ActiveDot active={!!u?.active} />
                  </div>
                  {u?.email ? (
                    <div className="text-xs text-gray-500 break-all">{u.email}</div>
                  ) : null}
                </div>

                {canManage && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditUser(u)}
                      className="px-3 py-1 rounded-xl border text-xs hover:bg-gray-50"
                    >
                      {t("Éditer")}
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteUser(u)}
                      className="px-3 py-1 rounded-xl border text-xs text-rose-600 hover:bg-rose-50"
                    >
                      {t("Supprimer")}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">{t("Téléphone")}</div>
                  <div className="break-words">{safe(u?.phone)}</div>
                </div>

                {/* Bloc dynamique mobile */}
                <div className="col-span-2">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">
                    {isDoctorsView ? t("Médecin") : t("Rôles")}
                  </div>

                  {isDoctorsView ? (
                    <div className="mt-1 flex items-center gap-2">
                      <TagPill tone={isDoctor ? "ok" : "muted"}>
                        {isDoctor ? t("Médecin") : t("Non médecin")}
                      </TagPill>
                      <span className="text-xs text-gray-600">
                        {clinic ? `${t("Clinique")}: ${clinic}` : "—"}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(u?.roles || []).length ? (
                        u.roles.map((role: any, idx: number) => (
                          <RoleChip key={role?._id ?? idx}>{role?.name ?? "—"}</RoleChip>
                        ))
                      ) : (
                        <>—</>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TableUsers;
