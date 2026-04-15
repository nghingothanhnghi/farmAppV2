// src/components/common/StageTimeline.tsx

import type { GrowthStage } from "../../models/interfaces/GrowthStage";
import LinearProgress from "./LinearProgress";

type Props = {
    stages: GrowthStage[];
    daysGrowing: number;
    currentStageId?: number;
    showCountdown?: boolean;        // default false
    progressPositionClass?: string;
    className?: string;
};

const StageTimeline: React.FC<Props> = ({
    stages,
    daysGrowing,
    currentStageId,
    showCountdown = false,
    progressPositionClass = "",
    className = ""
}) => {
    if (!stages.length) return null;

    const totalDays = stages[stages.length - 1].day_end;

    // ✅ PRIORITY: use backend current_stage_id
    let currentIndex = stages.findIndex(s => s.id === currentStageId);

    // 👉 fallback if backend not ready
    if (currentIndex === -1) {
        currentIndex = stages.findIndex(
            (s) =>
                daysGrowing >= s.day_start &&
                daysGrowing <= s.day_end
        );
    }

    // 👉 fallback again (edge case)
    if (currentIndex === -1) {
        currentIndex = stages.length - 1;
    }

    const currentStage = stages[currentIndex];

    // ✅ remaining days in CURRENT stage
    const remainingDays = currentStage
        ? Math.max(currentStage.day_end - daysGrowing, 0)
        : 0;

    const isLastStage = currentIndex === stages.length - 1;

    // ✅ next stage (if exists)
    const nextStage = !isLastStage ? stages[currentIndex + 1] : null;

    const progress = Math.min((daysGrowing / totalDays) * 100, 100);

    return (
        <div className={`relative w-full space-y-1 ${className}`}>
            <div className="flex items-center justify-between">
                {/* 👉 Stage label */}
                <div className="text-[10px] text-gray-600 dark:text-gray-400">
                    <span>{currentIndex + 1}/{stages.length} -{" "}</span>
                    <span>{currentStage?.name || "Unknown"}</span>
                </div>
                {/* 👉 info */}
                <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                    Ngày {daysGrowing} / {totalDays} ngày
                </div>
            </div>
            <div className={progressPositionClass}>
                {/* 👉 Progress bar */}
                <LinearProgress
                    value={progress}
                    thickness="h-1"
                />
            </div>
                                {/* ✅ OPTIONAL Countdown */}
                    {showCountdown && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 flex justify-end">
                            {isLastStage ? (
                                <span>🌿 Final stage</span>
                            ) : (
                                <span>
                                    ⏳ {remainingDays} ngày nữa → {nextStage?.name}
                                </span>
                            )}
                        </div>
                    )}
        </div>
    );
};

export default StageTimeline;