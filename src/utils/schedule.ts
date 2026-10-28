// src/utils/schedule.ts
import type { HydroScheduleOut } from '../models/interfaces/HydroSchedule';

export const JS_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export interface NextScheduleEvent {
  at: Date;
  type: 'on' | 'off';
  schedule: HydroScheduleOut;
}

/** Earliest upcoming ON (start_time) or OFF (end_time) across active schedules. */
export function getNextScheduleEvent(
  schedules: HydroScheduleOut[],
  from: Date = new Date()
): NextScheduleEvent | null {
  let best: NextScheduleEvent | null = null;

  for (const s of schedules) {
    if (!s.is_active) continue;
    const days = new Set(s.repeat_days.split(',').map((d) => d.trim().toLowerCase()));

    for (let offset = 0; offset <= 7; offset++) {
      const day = new Date(from);
      day.setDate(day.getDate() + offset);
      if (!days.has(JS_DAYS[day.getDay()])) continue;

      const events: [string, 'on' | 'off'][] = [
        [s.start_time, 'on'],
        [s.end_time, 'off'],
      ];
      for (const [time, type] of events) {
        const [h, m] = time.split(':').map(Number);
        const at = new Date(day);
        at.setHours(h, m, 0, 0);
        if (at > from && (!best || at < best.at)) best = { at, type, schedule: s };
      }
    }
  }
  return best;
}
