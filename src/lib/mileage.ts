import { differenceInCalendarDays, parseISO } from 'date-fns';

export interface OdometerPoint {
  valueKm: number;
  date: string;
}

const AVERAGE_DAYS_PER_MONTH = 30.44;

/** Average km/month between the earliest and latest reading. Null if not enough data. */
export function averageKmPerMonth(readings: OdometerPoint[]): number | null {
  if (readings.length < 2) return null;
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const days = differenceInCalendarDays(parseISO(last.date), parseISO(first.date));
  if (days <= 0) return null;
  const months = days / AVERAGE_DAYS_PER_MONTH;
  return Math.round((last.valueKm - first.valueKm) / months);
}
