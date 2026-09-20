// src/utils/aiVision.ts

export type BadgeVariant =
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "gray";

export const severityVariant: Record<string, BadgeVariant> = {
    low: "info",
    medium: "warning",
    high: "danger",
    critical: "danger",
};

export const getJobVariant = (status: string): BadgeVariant =>
    status === "completed"
        ? "success"
        : status === "failed"
            ? "danger"
            : "warning";

export const getRecommendationVariant = (
    status: string
): BadgeVariant =>
    status === "approved"
        ? "success"
        : status === "rejected"
            ? "danger"
            : status === "applied"
                ? "info"
                : "gray";

export const formatLabel = (value: string) =>
    value.replace(/_/g, " ");