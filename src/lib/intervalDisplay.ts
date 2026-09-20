import type { TFunction } from 'i18next';

import type { BadgeTone } from '@/components/ui/SeverityBadge';
import type { IntervalEvaluation, IntervalStatus } from '@/domain/interval-engine';

export function statusToTone(status: IntervalStatus): BadgeTone {
  switch (status) {
    case 'overdue':
      return 'stop';
    case 'due-soon':
      return 'soon';
    case 'ok':
      return 'safe';
    default:
      return 'neutral';
  }
}

export function statusLabel(t: TFunction, status: IntervalStatus): string {
  switch (status) {
    case 'overdue':
      return t('intervals.statusOverdue');
    case 'due-soon':
      return t('intervals.statusDueSoon');
    case 'ok':
      return t('intervals.statusOk');
    default:
      return t('intervals.statusUnknown');
  }
}

/** Plain-language "due in ~X km or Y days" / "overdue by X" message for a reminder. */
export function formatDueMessage(t: TFunction, evaluation: IntervalEvaluation): string {
  const { status, remainingKm, remainingDays, triggeredBy } = evaluation;

  if (status === 'unknown') return t('intervals.neverServiced');

  if (status === 'overdue') {
    if (triggeredBy === 'km' && remainingKm != null) {
      return t('dashboard.overdueByKm', { km: Math.abs(Math.round(remainingKm)) });
    }
    if (triggeredBy === 'date' && remainingDays != null) {
      return t('dashboard.overdueByDays', { days: Math.abs(Math.round(remainingDays)) });
    }
  }

  if (remainingKm != null && remainingDays != null) {
    return t('dashboard.dueInKmOrDays', { km: Math.round(remainingKm), days: Math.round(remainingDays) });
  }
  if (remainingKm != null) return t('dashboard.dueInKm', { km: Math.round(remainingKm) });
  if (remainingDays != null) return t('dashboard.dueInDays', { days: Math.round(remainingDays) });
  return statusLabel(t, status);
}
