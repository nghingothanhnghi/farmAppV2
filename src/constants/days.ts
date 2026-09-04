// src/constants/days.ts

// ✅ Values sent to backend — never translate these
export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export type DayValue = typeof DAYS[number];

// ✅ Display-only labels (Vietnamese)
export const DAY_LABELS_VI: Record<DayValue, string> = {
  mon: "T2",
  tue: "T3",
  wed: "T4",
  thu: "T5",
  fri: "T6",
  sat: "T7",
  sun: "CN",
};

// ✅ Optional English fallback (if you ever support switching UI language)
export const DAY_LABELS_EN: Record<DayValue, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

/**
 * Get a display label for a day value, based on current i18n language.
 * Falls back to English if language isn't Vietnamese.
 */
export const getDayLabel = (day: string, lang: string = "vi"): string => {
  const value = day as DayValue;
  return lang === "vi" ? DAY_LABELS_VI[value] ?? day : DAY_LABELS_EN[value] ?? day;
};