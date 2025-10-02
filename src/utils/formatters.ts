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

/**
 * Formats file size (bytes) to KB/MB
 */
export const formatFileSize = (size: number): string => {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} Bytes`;
};

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

