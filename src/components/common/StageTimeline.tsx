// src/components/common/StageTimeline.tsx

import type { GrowthStage } from "../../models/interfaces/GrowthStage";
import LinearProgress from "./LinearProgress";

type Props = {
    stages: GrowthStage[];
    daysGrowing: number;
    currentStageId?: number;
};

const StageTimeline: React.FC<Props> = ({ stages, daysGrowing, currentStageId }) => {
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

    const progress = Math.min((daysGrowing / totalDays) * 100, 100);

    return (
        <div className="relative w-full">
            <div className="flex items-center justify-between">
                {/* 👉 Stage label */}
                <span className="text-[10px] text-gray-600 dark:text-gray-400">
                    <span>{currentIndex + 1}/{stages.length} -{" "}</span>
                    <span>{currentStage?.name || "Unknown"}</span>
                </span>
                {/* 👉 info */}
                <span className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                    <span>Day {daysGrowing} -</span>
                    <span>{totalDays} days</span>
                </span>
            </div>
            <div className="absolute bottom-0 left-0 w-full">
                {/* 👉 Progress bar */}
                <LinearProgress
                    value={progress}
                    thickness="h-2"
                />
            </div>
        </div>
    );
};

export default StageTimeline;