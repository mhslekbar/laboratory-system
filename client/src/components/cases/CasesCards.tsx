// src/components/cases/CasesCards.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { ProgressBar } from "./AboutCard/ProgressBar";
import { Stage } from "./types";
import type { CasesCardsInterface } from "./types";
import TimeLine from "./AboutCard/TimeLine";
import Corps from "./AboutCard/Corps";

const labelOfDelivery = (s?: string, t: any = (x: string) => x) =>
  s === "scheduled"
    ? t("Prêt")
    : s === "delivered"
    ? t("Livré")
    : s === "returned"
    ? t("Retourné")
    : t("En attente");

const pickCurrentStage = (stages?: Stage[], currentOrder?: number) => {
  if (!stages?.length) return undefined;
  return (
    stages.find((s) => s.order === currentOrder) ||
    stages.find((s) => s.status === "in_progress") ||
    stages[0]
  );
};

const progressPct = (stages?: Stage[], currentOrder?: number): number => {
  if (!stages || stages.length === 0) return 0;

  let sum = stages.reduce((acc, s) => {
    if (s.status === "done") return acc + 1;
    if (s.status === "in_progress") return acc + 0.5;
    return acc;
  }, 0);

  if (sum === 0 && currentOrder != null && currentOrder > 0) {
    const prevCount = stages.filter((s) => s.order < currentOrder).length;
    sum = prevCount + 0.5;
  }

  const total = stages.length;
  let pct = (sum / total) * 100;

  if (pct > 0 && pct < 3) pct = 3;
  pct = Math.max(0, Math.min(100, pct));

  return Math.round(pct);
};

const CasesCards: React.FC<CasesCardsInterface> = ({
  items,
  onEdit,
  onDelete,
  onOpenDelivery,
  onAdvanceStage,
  onRewindStage,
  onJumpStage,
  jumpPolicy = "forward-when-previous-done",
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {(!items || items.length === 0) && (
        <div className="col-span-full rounded-2xl border p-6 text-center text-gray-500 bg-white">
          {t("Aucun dossier trouvé")}
        </div>
      )}

      {items?.map((row: any, i) => {
        const stages = [...(row.stages || [])].sort(
          (a, b) => a.order - b.order
        );
        const current = pickCurrentStage(stages, row.currentStageOrder);
        const currentIdx = current
          ? stages.findIndex((s) => s.order === current.order)
          : -1;

        const prevStage = currentIdx > 0 ? stages[currentIdx - 1] : undefined;
        const nextStage =
          currentIdx >= 0 && currentIdx < stages.length - 1
            ? stages[currentIdx + 1]
            : undefined;

        const isAtLast = stages.length > 0 && !nextStage;
        const isFullyDone =
          stages.length > 0 && stages.every((s) => s.status === "done");

        const bg = current?.color || "#f1f5f9";
        const borderColor = "rgba(0,0,0,0.12)";
        const pct = progressPct(stages, row.currentStageOrder);

        return (
          <article
            key={row.id ?? row._id ?? i}
            className="rounded-2xl border shadow-sm overflow-hidden bg-white"
            style={{ borderColor }}
          >
            <div
              className="p-2 border-b"
              style={{ background: bg, borderColor }}
            >
              <TimeLine
                stages={stages}
                row={row}
                onJumpStage={onJumpStage}
                jumpPolicy={jumpPolicy}
                borderColor={borderColor}
              />
              <ProgressBar
                value={pct}
                color={current?.color}
                label={t("Avancement") as string}
              />
            </div>

            <Corps
              t={t}
              row={row}
              pct={pct}
              labelOfDelivery={labelOfDelivery}
              prevStage={prevStage}
              onRewindStage={onRewindStage}
              nextStage={nextStage}
              onAdvanceStage={onAdvanceStage}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpenDelivery={onOpenDelivery}
              isAtLast={isAtLast}
              isFullyDone={isFullyDone}
            />
          </article>
        );
      })}
    </div>
  );
};

export default CasesCards;
