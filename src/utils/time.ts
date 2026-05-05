// utils/time.ts

// ✅ "HH:mm" → minutes
export const timeToMinutes = (time: string): number => {
  if (!time) throw new Error("Invalid time");

  const [h, m] = time.split(":").map(Number);

  if (isNaN(h) || isNaN(m)) {
    throw new Error(`Invalid time format: ${time}`);
  }

  return h * 60 + m;
};

// ✅ minutes → "HH:mm"
export const minutesToTime = (minutes: number): string => {
  if (minutes < 0) throw new Error("Minutes must be >= 0");

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// ✅ UI → API ("HH:mm" → "HH:mm:ss")
export const toApiTime = (time: string): string => {
  if (!time) throw new Error("Invalid time");

  // prevent double append
  if (time.length === 8) return time;

  return `${time}:00`;
};

// ✅ API → UI ("HH:mm:ss" → "HH:mm")
export const fromApiTime = (time: string): string => {
  if (!time) throw new Error("Invalid time");

  return time.slice(0, 5);
};