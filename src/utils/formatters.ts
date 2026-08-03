// src/utils/formatters.ts

// ==============================
// String
// ==============================

/**
 * Formats a device serial number for display
 */
export const formatDeviceSerial = (serial: string): string => {
  // Example formatting logic
  if (serial.length > 10) {
    return `${serial.substring(0, 8)}...`;
  }
  return serial;
};

/**
 * Formats coordinates for display
 */
export const formatCoordinates = (x: number, y: number): string => {
  return `(${x}, ${y})`;
};


// ==============================
// Number
// ==============================

/**
 * Formats file size (bytes) to KB/MB
 */
export const formatFileSize = (size: number): string => {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} Bytes`;
};

// Format number into locale string (e.g. "1,234,567.89")
export const formatCurrency = (value: number, locale = navigator.language): string => {
  if (!value || isNaN(value)) return "";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

// Parse a localized numeric string back into a number
export const parseLocaleNumber = (value: string, locale = navigator.language): number => {
  const example = Intl.NumberFormat(locale).format(1.1);
  const decimalSeparator = example.charAt(1);
  const normalized = value
    .replace(new RegExp(`[^0-9${decimalSeparator}]`, "g"), "")
    .replace(decimalSeparator, ".");
  return parseFloat(normalized) || 0;
}

// ==============================
// Date & Time - Display
// ==============================

/**
 * Formats countdown timer from seconds to "Xm Ss"
 */
export const formatTimeCountDown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
};

/**
 * Formats a date string or Date object to Vietnamese locale with weekday, hour, and minute
 * @param dateString - Date string or Date object
 * @returns Formatted date string like "Thứ Năm, 15:33"
 */
export const formatDateVN = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleString('vi-VN', {
    weekday: "long", // Thứ
    day: "2-digit",  // Ngày
    month: "2-digit", // Tháng
    year: "numeric",  // Năm
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ==============================
// Date & Time - Conversion
// ==============================

// ✅ helpers to convert between <input type="datetime-local"> (no timezone, "YYYY-MM-DDTHH:mm")
// and ISO strings the backend expects ("2026-08-10T09:00:00Z")
export const isoToDatetimeLocal = (iso?: string | null): string => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const datetimeLocalToIso = (value: string): string | undefined => {
    if (!value) return undefined;
    const d = new Date(value); // interpreted in the browser's local timezone
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString(); // → UTC ISO string, e.g. "2026-08-10T09:00:00.000Z"
};





