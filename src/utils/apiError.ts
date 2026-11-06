// src/utils/apiError.ts
// Normalises FastAPI error bodies (see CMS guide §5):
//   - 400/403/404/409 → { detail: "message" }
//   - 422             → { detail: [{ loc, msg, type }] }

interface ValidationItem {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

const fieldName = (loc?: (string | number)[]): string =>
  (loc ?? []).filter((p) => p !== "body" && p !== "query").join(".");

/** Field-level messages for a 422, keyed by field name (e.g. "title", "scheduled_at"). */
export const getApiFieldErrors = (err: any): Record<string, string> => {
  const detail = err?.response?.data?.detail;
  const out: Record<string, string> = {};
  if (Array.isArray(detail)) {
    for (const item of detail as ValidationItem[]) {
      const key = fieldName(item?.loc);
      if (key && item?.msg && !out[key]) out[key] = item.msg;
    }
  }
  return out;
};

/** A single human-readable string, always safe to hand to an alert. */
export const getApiErrorMessage = (err: any, fallback: string): string => {
  const detail = err?.response?.data?.detail;

  if (typeof detail === "string" && detail) return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const parts = (detail as ValidationItem[])
      .map((item) => {
        const key = fieldName(item?.loc);
        return item?.msg ? (key ? `${key}: ${item.msg}` : item.msg) : null;
      })
      .filter(Boolean);
    if (parts.length > 0) return parts.join("; ");
  }

  return fallback;
};
