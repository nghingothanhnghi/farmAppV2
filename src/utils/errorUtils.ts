// src/utils/errorUtils.ts
interface ParsedError {
  fieldErrors: Record<string, string>;
  message: string;
}

export function parseApiErrors(err: any): ParsedError {
  const result: ParsedError = {
    fieldErrors: {},
    message: "An unexpected error occurred",
  };

  // Handle Yup validation errors
  if (err?.name === "ValidationError" && err?.path) {
    result.fieldErrors[err.path] = err.message;
    result.message = err.message;
    return result;
  }

  // Handle backend validation array (FastAPI-style)
  const detail = err?.response?.data?.detail;

  if (Array.isArray(detail)) {
    for (const d of detail) {
      const field = d.loc?.[1] || "general";
      const msg = d.msg || "Invalid input";
      result.fieldErrors[field] = msg;
    }

    // Use the first message for alert
    result.message = Object.values(result.fieldErrors)[0] || result.message;
    return result;
  }

  // Handle single string error message
  if (typeof detail === "string") {
    result.fieldErrors.general = detail;
    result.message = detail;
    return result;
  }

  // Fallback to error message if any
  if (err?.message) {
    result.message = err.message;
  }

  return result;
}
