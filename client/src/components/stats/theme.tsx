// src/components/stats/theme.tsx
import React from "react";

// 🔁 Nouveau set exclusif
export type StatusKey = "pending" | "ready" | "delivered" | "received";

// (option) alias thème legacy
export const THEME_ALIAS = { completed: "delivered" as const };

// Palette (completed → delivered)
export const STATUS_COLORS: Record<
  StatusKey | "grid" | "muted",
  { main: string; light?: string } | any
> = {
  pending:   { main: "#f59e0b", light: "#fde68a" }, // amber
  ready:     { main: "#0ea5e9", light: "#bae6fd" }, // sky
  delivered: { main: "#6366f1", light: "#c7d2fe" }, // indigo
  received:  { main: "#10b981", light: "#a7f3d0" }, // emerald
  grid:      "#e5e7eb",
  muted:     "#6b7280",
};

// 🔀 Tolère encore "completed" en entrée et mappe vers "delivered"
const normalizeThemeKey = (k: StatusKey | "completed"): StatusKey =>
  k === "completed" ? "delivered" : k;

export const getFill = (prefix: string, key: StatusKey | "completed") =>
  `url(#${prefix}-${normalizeThemeKey(key)})`;

export const Gradients: React.FC<{ idPrefix: string }> = ({ idPrefix }) => {
  const keys: StatusKey[] = ["pending", "ready", "delivered", "received"];
  return (
    <defs>
      {keys.map((k) => (
        <linearGradient id={`${idPrefix}-${k}`} x1="0" y1="0" x2="0" y2="1" key={k}>
          <stop offset="0%"  stopColor={STATUS_COLORS[k].light} />
          <stop offset="100%" stopColor={STATUS_COLORS[k].main} />
        </linearGradient>
      ))}
    </defs>
  );
};
