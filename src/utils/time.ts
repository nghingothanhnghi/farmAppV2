// Convert "HH:mm" → minutes
export const timeToMinutes = (time: string): number => {
  if (!time) return 0;

  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Convert minutes → "HH:mm"
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Normalize to API format "HH:mm:ss"
export const toApiTime = (time: string): string => {
  return `${time}:00`;
};