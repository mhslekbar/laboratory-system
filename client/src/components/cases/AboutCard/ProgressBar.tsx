// src/components/cases/AboutCard/ProgressBar.tsx
import React from "react";

type ProgressBarProps = {
  value: number;   // 0..100
  color?: string;  // optional fill color (ex: stage color)
  label?: string;  // aria label
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, color, label }) => {
  const pct = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const barColor = "#EEE"; // indigo-600 fallback
  // const barColor = color || "rgb(37 99 235)"; // indigo-600 fallback

  return (
    <div
      className="h-1.5 w-full mt-1 rounded-full bg-black/10 overflow-hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      title={`${pct}%`}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: barColor, transition: "width .35s ease" }}
      />
    </div>
  );
};
