import React from "react";
import type { GrowthPrediction } from "../../../../models/interfaces/AiVision";

interface Props {
    prediction: GrowthPrediction | null;
}

const formatDate = (value?: string | null) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const formatNumber = (
    value?: number | null,
    maximumFractionDigits = 1
) => {
    if (value == null || Number.isNaN(value)) return "—";

    return value.toLocaleString(undefined, {
        maximumFractionDigits,
    });
};

const GrowthPredictionCard: React.FC<Props> = ({ prediction }) => {
    if (!prediction) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Growth Prediction
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    No growth prediction available yet.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Growth Prediction
                    </h3>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {prediction.horizon_days}-day forecast
                    </p>
                </div>

                {prediction.confidence != null && (
                    <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatNumber(prediction.confidence * 100)}%
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Confidence
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Predicted growth
                    </div>

                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {prediction.predicted_growth_pct != null
                            ? `${formatNumber(prediction.predicted_growth_pct)}%`
                            : "—"}
                    </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Target date
                    </div>

                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatDate(prediction.target_date)}
                    </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Predicted canopy
                    </div>

                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatNumber(prediction.predicted_canopy_area_px)} px²
                    </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Growth rate
                    </div>

                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {prediction.basis_growth_rate_pct_per_day != null
                            ? `${formatNumber(
                                  prediction.basis_growth_rate_pct_per_day
                              )}% / day`
                            : "—"}
                    </div>
                </div>
            </div>

            {prediction.current_stage_name && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    Current stage:{" "}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {prediction.current_stage_name}
                    </span>
                </div>
            )}

            {prediction.projected_stage_transition_date && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Projected stage transition:{" "}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(
                            prediction.projected_stage_transition_date
                        )}
                    </span>
                </div>
            )}

            {prediction.reasons?.length > 0 && (
                <div className="mt-4">
                    <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        Prediction basis
                    </div>

                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        {prediction.reasons.map((reason, index) => (
                            <li key={index} className="flex gap-2">
                                <span>•</span>
                                <span>{reason}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default GrowthPredictionCard;