import React, { useContext, useEffect, useMemo, useState } from "react";
import { AddUserContext } from "../types";
import { PermissionType } from "../../roles/types";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { State } from "../../../redux/store";
import { FiEye, FiEyeOff, FiSearch, FiCheck, FiX } from "react-icons/fi";

const InputsAddUser: React.FC = () => {
  const {
    fullName, setFullName,
    username, setUsername,
    phone, setPhone,
    password, setPassword,
    checkedRoles, setCheckedRoles,
    isDoctor, setIsDoctor,
    clinicName, setClinicName,
  } = useContext(AddUserContext);

  const { roles } = useSelector((state: State) => state.roles);
  const [listRoles, setListRoles] = useState<PermissionType[]>([]);
  const [roleQuery, setRoleQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { t } = useTranslation();

  useEffect(() => { setListRoles((roles as PermissionType[]) || []); }, [roles]);

  const filteredRoles = useMemo(() => {
    const q = roleQuery.trim().toLowerCase();
    if (!q) return listRoles;
    return listRoles.filter((r) => r?.name?.toLowerCase().includes(q));
  }, [listRoles, roleQuery]);

  const isChecked = (role: PermissionType) =>
    checkedRoles?.some((r) => String(r._id) === String(role._id));

  const toggleRole = (role: PermissionType) => {
    if (isChecked(role)) {
      setCheckedRoles(checkedRoles.filter((r) => String(r._id) !== String(role._id)));
    } else {
      setCheckedRoles([...(checkedRoles || []), role]);
    }
  };

  const selectAll = () => setCheckedRoles(filteredRoles);
  const clearAll = () => setCheckedRoles([]);

  return (
    <div className="space-y-5">
      {/* Nom complet / Username */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium mb-1 block">
            {t("Nom complet")} <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={fullName ?? ""}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t("Nom complet") as string}
            className="h-11 w-full rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">
            {t("Nom d'utilisateur")} <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={username ?? ""}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("Nom d'utilisateur") as string}
            className="h-11 w-full rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Téléphone / Mot de passe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium mb-1 block">{t("Téléphone")}</label>
          <input
            type="tel"
            value={phone ?? ""}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("Téléphone") as string}
            className="h-11 w-full rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">
            {t("Mot de passe")} <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password ?? ""}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("Mot de passe") as string}
              autoComplete="new-password"
              className="h-11 w-full rounded-xl border px-3 pr-10 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={showPassword ? (t("Masquer") as string) : (t("Afficher") as string)}
              title={showPassword ? (t("Masquer") as string) : (t("Afficher") as string)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
      </div>

      {/* Médecin toggle + Clinique */}
      <div className="rounded-xl border p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">{t("Médecin")} ?</div>
          <button
            type="button"
            onClick={() => setIsDoctor(!isDoctor)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${isDoctor ? "bg-indigo-600" : "bg-gray-300"}`}
            aria-pressed={isDoctor}
            aria-label={t("Basculer médecin") as string}
            title={t("Basculer médecin") as string}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${isDoctor ? "translate-x-5" : "translate-x-1"}`} />
          </button>
        </div>

        {isDoctor && (
          <div className="mt-3">
            <label className="text-xs font-medium mb-1 block">{t("Nom de la clinique")}</label>
            <input
              type="text"
              value={clinicName ?? ""}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder={t("Nom de la clinique") as string}
              className="h-11 w-full rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-[11px] text-gray-500">{t("Facultatif.")}</p>
          </div>
        )}
      </div>

      {/* Rôles */}
      <fieldset className="rounded-xl border p-3">
        <legend className="px-1 text-sm font-semibold">{t("Rôles")} <span className="text-rose-600">*</span></legend>

        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={roleQuery}
              onChange={(e) => setRoleQuery(e.target.value)}
              placeholder={t("Rechercher un rôle") as string}
              className="h-9 w-full rounded-md border pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={selectAll}
              className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 font-medium text-indigo-700"
            >
              <FiCheck /> {t("Tout sélectionner")}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-md border bg-white px-2 py-1 font-medium text-gray-700"
            >
              <FiX /> {t("Effacer")}
            </button>

            <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
              {checkedRoles?.length || 0} {t("sélectionné(s)")}
            </span>
          </div>
        </div>

        <div className="max-h-44 overflow-auto rounded-md border p-2">
          {filteredRoles.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-gray-500">
              {t("Aucun rôle trouvé")}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredRoles.map((role) => {
                const checked = isChecked(role);
                return (
                  <label
                    key={String(role._id)}
                    htmlFor={`role-${role._id}`}
                    className={`cursor-pointer select-none rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      checked ? "border-indigo-600 bg-indigo-600 text-white shadow" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      id={`role-${role._id}`}
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleRole(role)}
                    />
                    {role.name}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default InputsAddUser;
