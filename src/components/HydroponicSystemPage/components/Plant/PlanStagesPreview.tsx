// src/components/HydroponicSystemPage/components/Plant/PlanStagesPreview.tsx
import React, { useMemo } from "react";
import { IconTimeline } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useGrowthPlanWithStages } from "../../../../hooks/useGrowthPlans";
import { getActuatorIcon } from "../../../../utils/actuator";
import Button from "../../../common/Button";
import Badge from "../../../common/Badge";
import Spinner from "../../../common/Spinner";

type Props = {
  planId?: number | null;
  /** highlight this stage (the batch's current stage) */
  currentStageId?: number | null;
  onEditStages?: () => void;
};

const PlanStagesPreview: React.FC<Props> = ({ planId, currentStageId, onEditStages }) => {
  const { t } = useTranslation();
  const { plan, loading, error } = useGrowthPlanWithStages(planId);

  const stages = useMemo(
    () => [...(plan?.stages ?? [])].sort((a, b) => a.day_start - b.day_start),
    [plan]
  );

  if (!planId) return null;

  if (loading && !plan) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Spinner size={14} /> Đang tải giai đoạn...
      </div>
    );
  }

  if (error && !plan) {
    return <p className="text-xs text-red-500">{error}</p>;
  }

  const hasStages = stages.length > 0;
  const totalDays = hasStages ? Math.max(...stages.map((s) => s.day_end)) : 0;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-gray-800/60 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-100">
          <IconTimeline size={16} />
          <span>
            Giai đoạn của kế hoạch {hasStages && <span className="text-xs text-gray-400 font-normal">({stages.length} giai đoạn · {totalDays} ngày)</span>}
          </span>
        </div>
        {onEditStages && (
          <Button
            type="button"
            label={
              hasStages
                ? t("btn.update_stage_automation")
                : t("btn.create_stage_automation")
            }
            variant="secondary"
            size="xs"
            rounded="lg"
            onClick={onEditStages}
          />
        )}
      </div>

      {!hasStages ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Kế hoạch này chưa có giai đoạn nào. Hãy tạo giai đoạn để hệ thống tự động hóa hoạt động.
        </p>
      ) : (
        <>
          {/* proportional bar */}
          <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
            {stages.map((s) => (
              <div
                key={s.id}
                title={`${s.name}: ${s.day_start} → ${s.day_end}`}
                style={{ flexGrow: Math.max(s.day_end - s.day_start + 1, 1) }}
                className={
                  s.id === currentStageId
                    ? "bg-orange-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }
              />
            ))}
          </div>

          {/* stage list */}
          <ul className="space-y-1.5">
            {stages.map((s, i) => {
              const isCurrent = s.id === currentStageId;
              return (
                <li
                  key={s.id}
                  className={`flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs ${
                    isCurrent
                      ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40"
                      : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 dark:text-gray-100 truncate">
                        {i + 1}. {s.name}
                      </span>
                      {isCurrent && <Badge label="Hiện tại" variant="success" size="xsmall" />}
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      Ngày {s.day_start} → {s.day_end}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {(s.recipes ?? []).length === 0 ? (
                      <span className="text-[10px] text-gray-400">Chưa có lịch</span>
                    ) : (
                      (s.recipes ?? []).map((r) => {
                        const { Icon, color } = getActuatorIcon(r.actuator_type);
                        return (
                          <span key={r.id} title={r.actuator_type.replace("_", " ")}>
                            <Icon size={14} className={color} />
                          </span>
                        );
                      })
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {onEditStages && (
        <p className="text-[10px] text-gray-400">
          Chỉnh sửa giai đoạn sẽ áp dụng cho mọi vụ trồng đang dùng kế hoạch này.
        </p>
      )}
    </div>
  );
};

export default PlanStagesPreview;