// src/components/common/StageTimeline.tsx

import type { GrowthStage } from "../../models/interfaces/GrowthStage";

type Props = {
    stages: GrowthStage[];
    daysGrowing: number;
};

const StageTimeline: React.FC<Props> = ({ stages, daysGrowing }) => {
    if (!stages.length) return null;

    const totalDays = stages[stages.length - 1].day_end;

    // 👉 find current stage index
    const currentIndex = stages.findIndex(
        (s) =>
            daysGrowing >= s.day_start &&
            daysGrowing <= s.day_end
    );

    const currentStage =
        currentIndex !== -1
            ? stages[currentIndex]
            : stages[stages.length - 1];

    const progress = Math.min((daysGrowing / totalDays) * 100, 100);

    return (
        <div className="flex-col space-y-1">
            <div className="flex items-center justify-between">
                {/* 👉 Stage label */}
                <div className="text-[10px] text-gray-600">
                    <span>{currentIndex + 1}/{stages.length} -{" "}</span>
                    <span>{currentStage?.name || "Unknown"}</span>
                </div>
                {/* 👉 info */}
                <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Day {daysGrowing} -</span>
                    <span>{totalDays} days</span>
                </div>
            </div>
            {/* 👉 Progress bar */}
            <div className="mt-1 overflow-hidden rounded-full bg-gray-200">
                <div
                    className="h-1 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default StageTimeline;