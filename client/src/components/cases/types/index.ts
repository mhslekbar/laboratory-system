// src/components/cases/types/index.ts
export type Stage = {
  /** Les champs key/name/order/color sont renvoyés par l’API (lookup) */
  key: string;
  name: string;
  order: number;
  status: "pending" | "in_progress" | "done";
  color?: string;
  startedAt?: string | null;
  completedAt?: string | null;
};

export type CaseRow = {
  id?: string;  // ← ajouté
  _id?: string;
  code?: string;
  patient?: any;
  doctor?: any;
  type?: any;
  stages?: Stage[];
  currentStageOrder?: number;
  delivery?: { status: "pending" | "scheduled" | "delivered" | "returned"; date?: string | null };
  note?: string;         // ← NEW: note globale du dossier
};

export type JumpPolicy =
  | "none"
  | "next-only"
  | "forward-any"
  | "forward-when-previous-done"
  | "both-when-previous-done";

export interface CasesCardsInterface {
  items: CaseRow[];
  onEdit?: (row: CaseRow) => void;
  onDelete?: (row: CaseRow) => void;
  onAdvanceStage?: (row: CaseRow, nextStage: Stage) => void;
  onRewindStage?: (row: CaseRow, prevStage: Stage) => void;
  onJumpStage?: (row: CaseRow, targetStage: Stage) => void;
  jumpPolicy?: JumpPolicy;
  onOpenDelivery?: (row: CaseRow) => void; // NEW
}
