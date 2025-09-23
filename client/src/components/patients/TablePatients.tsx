// src/components/patients/TablePatients.tsx
import React, { useContext } from "react";
import { PatientInterface } from "./types";
import { FaEdit } from "react-icons/fa";
import { MdRemoveCircle } from "react-icons/md";
import { ShowPatientContext } from "./ShowPatients";
import { useTranslation } from "react-i18next";

interface TablePatientsInterface {
  patients: PatientInterface[];
  canManage?: boolean;
}

const calcAge = (dob?: Date | string | null): string => {
  if (!dob) return "—";
  const d = typeof dob === "string" ? new Date(dob) : dob;
  if (isNaN(d.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 && age < 130 ? String(age) : "—";
};

const initialsOf = (s?: string) => (s?.trim()?.[0]?.toUpperCase() ?? "P");
const safe = (v?: any) => (v !== undefined && v !== null && String(v).trim().length ? String(v) : "—");

const Pill: React.FC<{ tone?: "ok" | "muted"; children: React.ReactNode }> = ({ tone = "ok", children }) => (
  <span
    className={[
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      tone === "ok"
        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
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

const TablePatients: React.FC<TablePatientsInterface> = ({ patients, canManage = false }) => {
  const { setShowEditModal, setSelectedPatient, setShowDeleteModal } = useContext(ShowPatientContext);
  const { t } = useTranslation();

  const toggleEditPatient = (patient: PatientInterface) => {
    setSelectedPatient(patient);
    setShowEditModal((prev: any) => !prev);
  };
  const toggleDeletePatient = (patient: PatientInterface) => {
    setSelectedPatient(patient);
    setShowDeleteModal((prev: any) => !prev);
  };

  return (
    <>
      {/* Desktop / Tablet ≥ sm */}
      <div className="hidden sm:block rounded-2xl border shadow-sm overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center">
                <th className="px-4 py-3 text-left font-medium">{t("Nom")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("Telephone")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("Age")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("Note")}</th>
                {canManage && <th className="px-4 py-3 text-left font-medium">{t("Médecin")}</th>}
                {canManage && <th className="px-4 py-3 text-center font-medium">{t("Actions")}</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {patients?.length ? (
                patients.map((p: PatientInterface, index) => {
                  const name = p?.name;
                  const phone = p?.phone;
                  const ageStr = calcAge((p as any)?.dob);
                  const ageNum = Number.isFinite(Number(ageStr)) ? Number(ageStr) : null;

                  const doctor =
                    typeof p.doctor === "object" && p.doctor
                      ? (p.doctor as any).fullName || (p.doctor as any).username
                      : undefined;

                  return (
                    <tr
                      key={(p as any)?._id ?? index}
                      className="bg-white even:bg-gray-50 hover:bg-gray-100/70 transition-colors"
                    >
                      {/* Nom + avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white grid place-content-center text-xs font-bold"
                            aria-hidden="true"
                          >
                            {initialsOf(name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate max-w-[260px]" title={safe(name)}>
                              {safe(name)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Téléphone */}
                      <td className="px-4 py-3">
                        <span title={phone}>{safe(phone)}</span>
                      </td>

                      {/* Âge */}
                      <td className="px-4 py-3">
                        {ageNum !== null ? <Pill>{ageNum} {t("ans")}</Pill> : <span>—</span>}
                      </td>

                      {/* Notes (tronquées mais titre complet) */}
                      <td className="px-4 py-3">
                        <span className="block truncate max-w-[320px]" title={safe(p?.notes)}>
                          {safe(p?.notes)}
                        </span>
                      </td>

                      {/* Médecin */}
                      {canManage && (
                        <td className="px-4 py-3">
                          {doctor ? <Pill tone="muted">{doctor}</Pill> : "—"}
                        </td>
                      )}

                      {/* Actions */}
                      {canManage && (
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <IconBtn
                              type="button"
                              onClick={() => toggleEditPatient(p)}
                              className="hover:ring-indigo-200 focus:ring-indigo-500"
                              aria-label={t("Editer patient") as string}
                              title={t("Editer patient") as string}
                            >
                              <FaEdit className="text-indigo-600 text-[18px]" />
                            </IconBtn>

                            <IconBtn
                              type="button"
                              onClick={() => toggleDeletePatient(p)}
                              className="hover:ring-rose-200 focus:ring-rose-500"
                              aria-label={t("Supprimer patient") as string}
                              title={t("Supprimer patient") as string}
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
                  <td colSpan={canManage ? 6 : 4} className="px-4 py-10 text-center">
                    <div className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-gray-500 bg-gray-50">
                      <span className="text-sm">{t("Aucun patient trouvé")}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile < sm */}
      <div className="sm:hidden space-y-3">
        {(!patients || patients.length === 0) && (
          <div className="rounded-2xl border p-4 text-center text-gray-500 text-sm bg-white">
            {t("Aucun patient trouvé")}
          </div>
        )}

        {patients?.map((p, i) => {
          const name = p?.name;
          const phone = p?.phone;
          const ageStr = calcAge((p as any)?.dob);
          const doctor =
            typeof p.doctor === "object" && p.doctor
              ? (p.doctor as any).fullName || (p.doctor as any).username
              : undefined;

          return (
            <div key={(p as any)?._id ?? i} className="rounded-2xl border p-4 shadow-sm bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">{t("Nom")}</div>
                  <div className="font-medium break-words">{safe(name)}</div>
                </div>

                {canManage && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleEditPatient(p)}
                      className="px-3 py-1 rounded-xl border text-xs hover:bg-gray-50"
                    >
                      {t("Éditer")}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDeletePatient(p)}
                      className="px-3 py-1 rounded-xl border text-xs text-rose-600 hover:bg-rose-50"
                    >
                      {t("Supprimer")}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">{t("Telephone")}</div>
                  <div className="break-words">{safe(phone)}</div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">{t("Age")}</div>
                  <div>{ageStr !== "—" ? `${ageStr} ${t("ans")}` : "—"}</div>
                </div>

                <div className="col-span-2">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">{t("Note")}</div>
                  <div className="break-words">{safe(p?.notes)}</div>
                </div>

                {canManage && (
                  <div className="col-span-2">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">{t("Médecin")}</div>
                    <div className="break-words">{doctor ? doctor : "—"}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TablePatients;
