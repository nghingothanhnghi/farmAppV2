// src/components/common/StageTimeline.tsx

import type { GrowthStage } from "../../models/interfaces/GrowthStage";
import LinearProgress from "./LinearProgress";
import { getActuatorIcon } from '../../utils/actuator';

type Props = {
    stages: GrowthStage[];
    // ✅ NEW
    plantName?: string;
    showPlantName?: boolean;
    showRecipe?: boolean;
    daysGrowing: number;
    currentStageId?: number;
    showCountdown?: boolean;        // default false
    progressPositionClass?: string;
    className?: string;
};

const StageTimeline: React.FC<Props> = ({
    stages,

    // ✅ NEW
    plantName,
    showPlantName = false,
    showRecipe = false,
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

    const recipes = currentStage?.recipes || [];

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
                <div className="text-[10px] text-gray-500 dark:text-gray-400 flex justify-between">
                    {/* ✅ Plant name (optional) */}
                    {showPlantName && plantName && (
                        <span className="font-medium">
                            {plantName}
                        </span>
                    )}

                    {isLastStage ? (
                        <span>🌿 Giai đoạn cuối</span>
                    ) : (
                        <span>
                            ⏳ {remainingDays} ngày nữa → {nextStage?.name}
                        </span>
                    )}
                </div>
            )}

            {showRecipe && recipes.length > 0 && (
                <div className="mt-2 border-t border-gray-200 dark:border-white/5 pt-2 space-y-1">
                    <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                        Recipe
                    </div>

                    {recipes.map(recipe => {
                        const {
                            Icon,
                            color,
                        } = getActuatorIcon(recipe.actuator_type);

                        return (
                            <div
                                key={recipe.id}
                                className="flex items-center justify-between text-[10px]"
                            >
                                <div className="flex items-center gap-1">
                                    <Icon
                                        size={12}
                                        className={color}
                                    />

                                    <span className="capitalize text-gray-500 dark:text-gray-400">
                                        {recipe.actuator_type.replace("_", " ")}
                                    </span>
                                </div>

                                {recipe.action === "interval" ? (
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {recipe.interval_on_min}m /
                                        {recipe.interval_off_min}m
                                    </span>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {recipe.start_time?.slice(0, 5)}
                                        {" → "}
                                        {recipe.end_time?.slice(0, 5)}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
};

export default StageTimeline;