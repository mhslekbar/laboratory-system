// src/components/cases/utils/canJump.ts
import type { Stage, JumpPolicy } from "../types";

export const canJump = (
  stages: Stage[],
  currentIdx: number,
  targetIdx: number,
  jumpPolicy: JumpPolicy,
  hasOnJump: boolean
): boolean => {
  if (!hasOnJump) return false;
  if (jumpPolicy === "none") return false;
  if (targetIdx === currentIdx) return false;

  const isForward = targetIdx > currentIdx;
  const chainDoneUntil = (idx: number) => stages.slice(0, idx).every((s) => s.status === "done");

  switch (jumpPolicy) {
    case "next-only":
      return targetIdx === currentIdx + 1;
    case "forward-any":
      return isForward;
    case "forward-when-previous-done":
      return isForward && chainDoneUntil(targetIdx);
    case "both-when-previous-done":
      return chainDoneUntil(targetIdx);
    default:
      return false;
  }
};
