// src/components/stats/ChartCard.tsx
import React, { ReactNode } from "react";


const ChartCard: React.FC<{ title: string; subtitle?: ReactNode; right?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  subtitle,
  right,
  children,
}) => {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle ? <p className="text-xs text-gray-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
};

export default ChartCard;
