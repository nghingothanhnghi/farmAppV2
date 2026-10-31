import React from "react";
import { IconBulb } from "@tabler/icons-react";
import Badge from "../../../common/Badge";
import Button from "../../../common/Button";
import EmptyState from "../../../common/EmptyState";
import { getRecommendationVariant, severityVariant } from "../../../../utils/aiVision";
import type {
    AIRecommendation,
    AIRecommendationStatusUpdate,
} from "../../../../models/interfaces/AiVision";

interface Props {
    recommendations: AIRecommendation[];
    onUpdateStatus?: (
        id: number,
        status: AIRecommendationStatusUpdate
    ) => void | Promise<void>;
}

const RecommendationsCard: React.FC<Props> = ({ recommendations, onUpdateStatus }) => (
    <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-3 flex items-center gap-2">
            <IconBulb size={16} />
            Recommendations

            {recommendations.length > 0 && (
                <span className="text-xs text-gray-400 font-normal">
                    ({recommendations.length})
                </span>
            )}
        </h3>

        {recommendations.length === 0 ? (
            <EmptyState message="No recommendations yet." />
        ) : (
            <div className="space-y-3">
                {recommendations.map((r) => (
                    <div
                        key={r.id}
                        className="rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-gray-800/80 p-3 space-y-2"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                    {r.recommendation}
                                </p>

                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    #{r.id} · {new Date(r.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <Badge
                                    label={r.status.replace(/_/g, " ")}
                                    variant={getRecommendationVariant(r.status)}
                                    size="xsmall"
                                />

                                {r.severity && (
                                    <Badge
                                        label={r.severity}
                                        variant={severityVariant[r.severity]}
                                        size="xsmall"
                                    />
                                )}
                            </div>
                        </div>

                        {r.confidence != null && (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-900 overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 dark:bg-blue-400"
                                        style={{
                                            width: `${Math.round(r.confidence * 100)}%`,
                                        }}
                                    />
                                </div>

                                <span className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0">
                                    {Math.round(r.confidence * 100)}% confidence
                                </span>
                            </div>
                        )}

                        {r.reasons && r.reasons.length > 0 && (
                            <div className="py-2 border-t border-gray-200 dark:border-white/5">
                                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                    Reasons
                                </p>

                                <ul className="space-y-1">
                                    {r.reasons.map((reason: string, i: number) => (
                                        <li
                                            key={i}
                                            className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5"
                                        >
                                            <span className="text-gray-400 mt-0.5">•</span>
                                            <span>{reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {onUpdateStatus && r.status === "pending_review" && (
                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-white/5">
                                <Button
                                    type="button"
                                    variant="link"
                                    linkColor="gray"
                                    size="xs"
                                    label="Dismiss"
                                    rounded="full"
                                    onClick={() => onUpdateStatus(r.id, "dismissed")}
                                />
                                {/* Advisory only: marks it as seen. Never changes actuators, schedules or irrigation. */}
                                <Button
                                    type="button"
                                    variant="link"
                                    linkColor="green"
                                    size="xs"
                                    className="bg-transparent"
                                    label="Acknowledge"
                                    rounded="full"
                                    onClick={() => onUpdateStatus(r.id, "acknowledged")}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default RecommendationsCard;