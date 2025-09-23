import React from "react";

const Corps = ({
  t,
  row,
  pct,
  labelOfDelivery,
  prevStage,
  onRewindStage,
  nextStage,
  onAdvanceStage,
  onEdit,
  onDelete,
  onOpenDelivery,
  isFullyDone,
  isAtLast,
}: any) => {
  // Verrouiller les actions si toutes les étapes sont done
  const canPrev = !!prevStage && !isFullyDone;
  const canNext = !!nextStage && !isFullyDone;
  // “Marquer reçu” : seulement si on est à la dernière étape et pas encore fully done
  const canMarkReceived = !!onOpenDelivery && isAtLast && !isFullyDone;

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            {t("Code")}
          </div>
          <div className="font-semibold break-words">{row.code || "—"}</div>
          <div className="mt-1 text-[11px] text-gray-500">
            {t("Avancement")} : {pct}%
          </div>
        </div>

        <div className="shrink-0">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium
                      ${
                        row.delivery?.status === "scheduled"
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : row.delivery?.status === "delivered"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : row.delivery?.status === "returned"
                          ? "border-sky-300 bg-sky-50 text-sky-700"
                          : "border-gray-300 bg-gray-50 text-gray-700"
                      }`}
            title={t("Statut de livraison") as string}
          >
            {labelOfDelivery(row.delivery?.status, t)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            {t("Patient")}
          </div>
          <div className="break-words">{row?.patient?.name || "—"}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            {t("Médecin")}
          </div>
          <div className="break-words">
            {row?.doctor?.fullName || row?.doctor?.username || "—"}
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            {t("Type")}
          </div>
          <div className="break-words">
            {row?.type?.name || row?.type?.key || "—"}
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            {t("Note")}
          </div>
          <div className="break-words whitespace-pre-wrap">
            {row?.note?.trim() || "—"}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-3 sm:gap-2">
        {/* Groupe navigation (gauche) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => canPrev && onRewindStage?.(row, prevStage)}
            className="h-9 px-3 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 bg-white
                      hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("Étape précédente") as string}
            aria-label={t("Étape précédente") as string}
          >
            ← {t("Précédente")}
          </button>

          <button
            type="button"
            disabled={!canNext}
            onClick={() => canNext && onAdvanceStage?.(row, nextStage)}
            className="h-9 px-3 rounded-xl text-xs font-semibold shadow-sm bg-indigo-600 text-white
                       hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("Étape suivante") as string}
            aria-label={t("Étape suivante") as string}
          >
            {t("Suivante")} →
          </button>
        </div>

        {(onEdit || onDelete || onOpenDelivery) && (
          /* Groupe actions (droite) */
          <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
            {onOpenDelivery && (
              <button
                type="button"
                onClick={() => canMarkReceived && onOpenDelivery(row)}
                disabled={!canMarkReceived}
                className="h-9 px-3 rounded-xl text-xs font-semibold shadow-sm
                           bg-emerald-600 text-white hover:bg-emerald-700
                           disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  isFullyDone
                    ? (t("Déjà marqué reçu") as string)
                    : isAtLast
                    ? (t("Marquer comme reçu") as string)
                    : (t("Disponible uniquement à la dernière étape") as string)
                }
              >
                {isFullyDone ? t("Reçu") : t("Marquer reçu")}
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(row)}
                className="h-9 px-3 rounded-xl text-xs font-semibold shadow-sm
                           bg-amber-500 text-white hover:bg-amber-600"
                title={t("Modifier") as string}
              >
                {t("Modifier")}
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(row)}
                className="h-9 px-3 rounded-xl text-xs font-semibold shadow-sm
                           bg-rose-600 text-white hover:bg-rose-700"
                title={t("Supprimer") as string}
              >
                {t("Supprimer")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Corps;
