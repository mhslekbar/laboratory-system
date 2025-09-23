// src/components/cases/AboutCard/TimeLine.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import type { CaseRow, JumpPolicy, Stage } from "../types";
import { canJump as canJumpUtil } from "../utils/CanJump"; // ← lower-case OK

type TimeLineProps = {
  stages: Stage[];
  row: CaseRow;
  onJumpStage?: (row: CaseRow, stage: Stage) => void;
  jumpPolicy?: JumpPolicy;
  borderColor?: string;
};

const TimeLine: React.FC<TimeLineProps> = ({
  stages = [],
  row,
  onJumpStage,
  jumpPolicy = "forward-when-previous-done",
  borderColor = "rgba(0,0,0,0.12)",
}) => {
  const { t } = useTranslation();

  const currentIdx = (() => {
    if (!stages?.length) return -1;
    const byOrder = stages.findIndex((s) => s.order === row.currentStageOrder);
    if (byOrder >= 0) return byOrder;
    const inProg = stages.findIndex((s) => s.status === "in_progress");
    return inProg >= 0 ? inProg : 0;
  })();

  return (
    <div className="flex items-center justify-center gap-1 overflow-x-auto no-scrollbar">
      {stages.map((s, idx) => {
        const done =
          s.status === "done" || (row.currentStageOrder || 0) > s.order;
        const isCurrent =
          (row.currentStageOrder || 0) === s.order || s.status === "in_progress";

        const allowed = canJumpUtil(
          stages,
          currentIdx,
          idx,
          jumpPolicy,
          !!onJumpStage
        );

        const title = isCurrent
          ? `${s.order}. ${s.name} • ${t("Étape actuelle")}`
          : allowed
          ? `${t("Aller à l’étape")} ${s.order}. ${s.name}`
          : `${s.order}. ${s.name}`;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => allowed && onJumpStage?.(row, s)}
            disabled={!allowed}
            className={`h-7 min-w-[2rem] px-2 grid place-items-center rounded-full text-[11px] font-bold select-none border
              ${isCurrent ? "bg-white" : done ? "bg-white/90" : "bg-white/70"}
              ${allowed ? "cursor-pointer hover:opacity-95" : "cursor-not-allowed opacity-75"}`}
            style={{ color: s.color || "#334155", borderColor }}
            title={title}
            aria-label={title}
          >
            {done ? "✓" : s.order}
          </button>
        );
      })}
    </div>
  );
};

export default TimeLine;
