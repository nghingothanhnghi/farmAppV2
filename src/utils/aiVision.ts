// src/utils/aiVision.ts
import type { BadgeVariant } from '../components/common/Badge';


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
    status === "acknowledged"
        ? "success"
        : status === "dismissed"
            ? "gray"
            : "warning";

export const getHealthVariant = (status?: string): BadgeVariant =>
  status === 'healthy' || status === 'normal'
    ? 'success'
    : 'warning';            


export const formatLabel = (value: string) =>
    value.replace(/_/g, " ");