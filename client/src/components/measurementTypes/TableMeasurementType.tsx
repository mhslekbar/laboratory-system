// components/measurementTypes/TableMeasurementType.tsx
import React from "react";
import { FiEdit2, FiTrash2, FiTag, FiList } from "react-icons/fi";
import { MeasurementTypeDto } from "./types";

type Props = {
  items: MeasurementTypeDto[];
  onEdit: (row: MeasurementTypeDto) => void;
  onDelete: (row: MeasurementTypeDto) => void;
};

const safe = (v?: any) =>
  v !== undefined && v !== null && String(v).trim().length ? String(v) : "—";

const IconBtn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "edit" | "delete" }
> = ({ className = "", tone = "edit", ...props }) => {
  const toneCls =
    tone === "edit"
      ? "hover:ring-indigo-200 focus:ring-indigo-500 hover:bg-indigo-50"
      : "hover:ring-rose-200 focus:ring-rose-500 hover:bg-rose-50";
  return (
    <button
      {...props}
      className={
        "p-2 rounded-lg ring-1 ring-transparent transition focus:outline-none " +
        toneCls +
        " " +
        className
      }
    />
  );
};

const StagePill: React.FC<{ name: string; order: number; color?: string }> = ({
  name,
  order,
  color,
}) => (
  <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full border shadow-sm bg-white">
    <span
      className="inline-block h-3 w-3 rounded-full"
      style={{ background: color || "#cbd5e1" }}
      aria-hidden
    />
    <span className="text-xs">
      {order}. {name}
    </span>
  </span>
);

const TableMeasurementType: React.FC<Props> = ({ items, onEdit, onDelete }) => {
  return (
    <>
      {/* Desktop / Tablet ≥ sm */}
      <div className="hidden sm:block rounded-2xl border shadow-sm overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <th className="px-4 py-3 text-left font-medium">
                  <div className="inline-flex items-center gap-2">
                    <FiTag aria-hidden /> Clé
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium">Nom</th>
                <th className="px-4 py-3 text-left font-medium">
                  <div className="inline-flex items-center gap-2">
                    <FiList aria-hidden /> Étapes
                  </div>
                </th>
                <th className="px-4 py-3 text-center font-medium w-40">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {items.length ? (
                items.map((row) => {
                  const stages = row?.stages || [];
                  return (
                    <tr
                      key={(row as any)._id || row.key}
                      className="bg-white even:bg-gray-50 hover:bg-gray-100/70 transition-colors"
                    >
                      {/* Clé */}
                      <td className="px-4 py-3 font-mono break-all align-top">{safe(row.key)}</td>

                      {/* Nom */}
                      <td className="px-4 py-3 align-top">
                        <span className="block truncate max-w-[340px]" title={safe(row.name)}>
                          {safe(row.name)}
                        </span>
                      </td>

                      {/* Étapes */}
                      <td className="px-4 py-3 align-top">
                        {stages.length === 0 ? (
                          <span className="text-xs text-gray-500">Aucune étape</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {stages.map((s, i) => (
                              <StagePill
                                key={s._id || `${row.key}-${i}`}
                                name={safe(s.name)}
                                order={Number(s.order ?? 0)}
                                color={s.color}
                              />
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 align-top">
                        <div className="flex items-center justify-center gap-2">
                          <IconBtn
                            tone="edit"
                            onClick={() => onEdit(row)}
                            aria-label="Éditer"
                            title="Éditer"
                          >
                            <FiEdit2 className="text-indigo-600 text-[18px]" />
                          </IconBtn>
                          <IconBtn
                            tone="delete"
                            onClick={() => onDelete(row)}
                            aria-label="Supprimer"
                            title="Supprimer"
                          >
                            <FiTrash2 className="text-rose-600 text-[18px]" />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center">
                    <div className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-gray-500 bg-gray-50">
                      Aucun type trouvé
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile < sm : cartes */}
      <div className="sm:hidden space-y-3">
        {items.length === 0 && (
          <div className="rounded-2xl border p-4 text-center text-gray-500 text-sm bg-white">
            Aucun type trouvé
          </div>
        )}

        {items.map((row) => {
          const stages = row?.stages || [];
          return (
            <div key={(row as any)._id || row.key} className="rounded-2xl border p-4 shadow-sm bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">Clé</div>
                  <div className="font-mono break-all">{safe(row.key)}</div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => onEdit(row)}
                    className="px-3 py-1 rounded-xl border text-xs hover:bg-gray-50"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => onDelete(row)}
                    className="px-3 py-1 rounded-xl border text-xs text-rose-600 hover:bg-rose-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Nom</div>
                <div className="break-words">{safe(row.name)}</div>
              </div>

              <div className="mt-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Étapes</div>
                {stages.length === 0 ? (
                  <div className="text-xs text-gray-500">Aucune étape</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {stages.map((s, i) => (
                      <span
                        key={s._id || `${row.key}-${i}`}
                        className="inline-flex items-center gap-2 px-2 py-1 rounded-full border shadow-sm"
                      >
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ background: s.color || "#cbd5e1" }}
                        />
                        <span className="text-[11px]">
                          {Number(s.order ?? 0)}. {safe(s.name)}
                        </span>
                      </span>
                    ))}
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

export default TableMeasurementType;
