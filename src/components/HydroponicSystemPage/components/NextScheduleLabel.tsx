// src/components/HydroponicSystemPage/components/NextScheduleLabel.tsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconClock } from '@tabler/icons-react';
import { useNow } from '../../../hooks/useNow';
import { getNextScheduleEvent, JS_DAYS } from '../../../utils/schedule';
import { getDayLabel } from '../../../constants/days';
import type { HydroScheduleOut } from '../../../models/interfaces/HydroSchedule';

interface Props {
  schedules: HydroScheduleOut[];
  className?: string;
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const NextScheduleLabel: React.FC<Props> = ({ schedules, className = '' }) => {
  const { t, i18n } = useTranslation();
  const now = useNow(30000); // re-evaluate every 30s
  const next = useMemo(
    () => getNextScheduleEvent(schedules, new Date(now)),
    [schedules, now]
  );

  if (!next) return null;

  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(today.getDate() + 1);

  const dayText = sameDay(next.at, today)
    ? t('schedule.today')
    : sameDay(next.at, tomorrow)
      ? t('schedule.tomorrow')
      : getDayLabel(JS_DAYS[next.at.getDay()], i18n.language);

  const time = next.at.toTimeString().slice(0, 5);
  const action = next.type === 'on' ? t('badge_status.on') : t('badge_status.off');

  return (
    <p className={`flex items-center gap-1 text-[0.625rem] text-gray-500 dark:text-gray-400 ${className}`}>
      <IconClock size={10} />
      {t('schedule.next')}: {action} · {dayText} {time}
    </p>
  );
};

export default NextScheduleLabel;
