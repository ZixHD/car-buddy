import { addMonths, differenceInCalendarDays } from 'date-fns';

export type IntervalStatus = 'unknown' | 'ok' | 'due-soon' | 'overdue';
export type IntervalBasis = 'km' | 'date';

export interface ServiceIntervalInput {
  intervalKm: number | null;
  intervalMonths: number | null;
  lastServiceOdometerKm: number | null;
  /** ISO date string (yyyy-MM-dd) */
  lastServiceDate: string | null;
  currentOdometerKm: number;
  now?: Date;
  dueSoonKmThreshold?: number;
  dueSoonDaysThreshold?: number;
}

export interface IntervalEvaluation {
  status: IntervalStatus;
  /** Odometer value at which this interval becomes due, if a km basis exists. */
  dueByKm: number | null;
  /** ISO date at which this interval becomes due, if a date basis exists. */
  dueByDate: string | null;
  /** Km remaining until due; negative once overdue. Null if no km basis. */
  remainingKm: number | null;
  /** Days remaining until due; negative once overdue. Null if no date basis. */
  remainingDays: number | null;
  /** Which basis is driving the current status. Null when status is 'ok' or 'unknown'. */
  triggeredBy: IntervalBasis | null;
}

const DEFAULT_DUE_SOON_KM = 500;
const DEFAULT_DUE_SOON_DAYS = 14;

/**
 * Evaluates a single service interval against the vehicle's current odometer/date,
 * using "whichever comes first" semantics between the km basis and the date basis.
 *
 * Degrades to 'unknown' when neither basis can be computed (e.g. a brand-new interval
 * with no recorded last-service odometer or date) rather than guessing a due date.
 */
export function evaluateServiceInterval(input: ServiceIntervalInput): IntervalEvaluation {
  const {
    intervalKm,
    intervalMonths,
    lastServiceOdometerKm,
    lastServiceDate,
    currentOdometerKm,
    now = new Date(),
    dueSoonKmThreshold = DEFAULT_DUE_SOON_KM,
    dueSoonDaysThreshold = DEFAULT_DUE_SOON_DAYS,
  } = input;

  const dueByKm =
    intervalKm != null && lastServiceOdometerKm != null ? lastServiceOdometerKm + intervalKm : null;

  const dueByDate =
    intervalMonths != null && lastServiceDate != null
      ? formatIsoDate(addMonths(parseIsoDate(lastServiceDate), intervalMonths))
      : null;

  const remainingKm = dueByKm != null ? dueByKm - currentOdometerKm : null;
  const remainingDays = dueByDate != null ? differenceInCalendarDays(parseIsoDate(dueByDate), now) : null;

  if (remainingKm == null && remainingDays == null) {
    return { status: 'unknown', dueByKm, dueByDate, remainingKm, remainingDays, triggeredBy: null };
  }

  const kmOverdue = remainingKm != null && remainingKm <= 0;
  const dateOverdue = remainingDays != null && remainingDays <= 0;
  const kmDueSoon = remainingKm != null && remainingKm <= dueSoonKmThreshold;
  const dateDueSoon = remainingDays != null && remainingDays <= dueSoonDaysThreshold;

  let status: IntervalStatus;
  let triggeredBy: IntervalBasis | null;

  if (kmOverdue || dateOverdue) {
    status = 'overdue';
    triggeredBy = pickBasis(kmOverdue, dateOverdue, remainingKm, remainingDays, dueSoonKmThreshold, dueSoonDaysThreshold);
  } else if (kmDueSoon || dateDueSoon) {
    status = 'due-soon';
    triggeredBy = pickBasis(kmDueSoon, dateDueSoon, remainingKm, remainingDays, dueSoonKmThreshold, dueSoonDaysThreshold);
  } else {
    status = 'ok';
    triggeredBy = null;
  }

  return { status, dueByKm, dueByDate, remainingKm, remainingDays, triggeredBy };
}

function pickBasis(
  kmFlag: boolean,
  dateFlag: boolean,
  remainingKm: number | null,
  remainingDays: number | null,
  kmThreshold: number,
  daysThreshold: number,
): IntervalBasis {
  if (kmFlag && !dateFlag) return 'km';
  if (dateFlag && !kmFlag) return 'date';
  // Both flags true: compare normalized urgency (|fraction of threshold| remaining).
  // Using absolute value means this also works when both are overdue (negative
  // remaining) — the basis closest to zero (least overdue, or soonest due) wins.
  const kmFraction = Math.abs(remainingKm! / kmThreshold);
  const dateFraction = Math.abs(remainingDays! / daysThreshold);
  return kmFraction <= dateFraction ? 'km' : 'date';
}

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface EvaluatedInterval<TId = string> {
  id: TId;
  evaluation: IntervalEvaluation;
}

/**
 * Ranks a set of already-evaluated intervals so the most urgent (most overdue,
 * or soonest due) sorts first. 'unknown' intervals sort last.
 */
export function sortByUrgency<TId>(items: EvaluatedInterval<TId>[]): EvaluatedInterval<TId>[] {
  const rank: Record<IntervalStatus, number> = { overdue: 0, 'due-soon': 1, ok: 2, unknown: 3 };
  return [...items].sort((a, b) => {
    const statusDiff = rank[a.evaluation.status] - rank[b.evaluation.status];
    if (statusDiff !== 0) return statusDiff;
    return urgencyScore(a.evaluation) - urgencyScore(b.evaluation);
  });
}

function urgencyScore(evaluation: IntervalEvaluation): number {
  const scores = [evaluation.remainingKm, evaluation.remainingDays].filter(
    (value): value is number => value != null,
  );
  if (scores.length === 0) return Number.POSITIVE_INFINITY;
  return Math.min(...scores);
}
