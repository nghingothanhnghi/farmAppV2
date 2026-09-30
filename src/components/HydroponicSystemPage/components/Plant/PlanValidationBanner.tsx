// src/components/HydroponicSystemPage/components/Plant/PlanValidationBanner.tsx
import React from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useGrowthPlanValidation } from "../../../../hooks/useGrowthPlans";

const fmt = (x: any): string => {
  if (x == null) return "";
  if (typeof x !== "object") return String(x);
  const a = x.from ?? x.start ?? x.day_start;
  const b = x.to ?? x.end ?? x.day_end;
  if (a != null && b != null) return a === b ? `ngày ${a}` : `ngày ${a} → ${b}`;
  return JSON.stringify(x);
};

const PlanValidationBanner: React.FC<{ planId?: number | null }> = ({ planId }) => {
  const { validation } = useGrowthPlanValidation(planId);
  if (!validation || validation.stage_count === 0) return null;

  const { gaps, overlaps } = validation;
  if (gaps.length === 0 && overlaps.length === 0) return null;

  return (
    <div className="space-y-2">
      {overlaps.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300">
          <IconAlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>Giai đoạn bị chồng lấn: {overlaps.map(fmt).join("; ")}</span>
        </div>
      )}
      {gaps.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
          <IconAlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>Có khoảng trống giữa các giai đoạn: {gaps.map(fmt).join("; ")}</span>
        </div>
      )}
    </div>
  );
};

export default PlanValidationBanner;