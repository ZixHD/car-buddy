import { evaluateServiceInterval, sortByUrgency } from './index';

const NOW = new Date(2026, 0, 15); // 2026-01-15

describe('evaluateServiceInterval', () => {
  it('returns unknown when neither km nor date basis can be computed', () => {
    const result = evaluateServiceInterval({
      intervalKm: 10000,
      intervalMonths: 12,
      lastServiceOdometerKm: null,
      lastServiceDate: null,
      currentOdometerKm: 50000,
      now: NOW,
    });
    expect(result.status).toBe('unknown');
    expect(result.remainingKm).toBeNull();
    expect(result.remainingDays).toBeNull();
  });

  it('evaluates using only the km basis when no last-service date is known', () => {
    const result = evaluateServiceInterval({
      intervalKm: 10000,
      intervalMonths: 12,
      lastServiceOdometerKm: 40000,
      lastServiceDate: null,
      currentOdometerKm: 48000,
      now: NOW,
    });
    expect(result.dueByKm).toBe(50000);
    expect(result.dueByDate).toBeNull();
    expect(result.remainingKm).toBe(2000);
    expect(result.status).toBe('ok');
  });

  it('evaluates using only the date basis when no last-service odometer is known', () => {
    const result = evaluateServiceInterval({
      intervalKm: null,
      intervalMonths: 12,
      lastServiceOdometerKm: null,
      lastServiceDate: '2025-01-20',
      currentOdometerKm: 48000,
      now: NOW,
    });
    expect(result.dueByDate).toBe('2026-01-20');
    expect(result.remainingDays).toBe(5);
    expect(result.status).toBe('due-soon');
    expect(result.triggeredBy).toBe('date');
  });

  it('is due-soon when within the km threshold', () => {
    const result = evaluateServiceInterval({
      intervalKm: 10000,
      intervalMonths: null,
      lastServiceOdometerKm: 40000,
      lastServiceDate: null,
      currentOdometerKm: 49700,
      now: NOW,
      dueSoonKmThreshold: 500,
    });
    expect(result.status).toBe('due-soon');
    expect(result.triggeredBy).toBe('km');
    expect(result.remainingKm).toBe(300);
  });

  it('is overdue when past the km basis, even if the date basis is not yet due', () => {
    const result = evaluateServiceInterval({
      intervalKm: 10000,
      intervalMonths: 24,
      lastServiceOdometerKm: 40000,
      lastServiceDate: '2025-06-01',
      currentOdometerKm: 51000,
      now: NOW,
    });
    expect(result.status).toBe('overdue');
    expect(result.triggeredBy).toBe('km');
    expect(result.remainingKm).toBe(-1000);
  });

  it('is overdue when past the date basis, even if the km basis is not yet due', () => {
    const result = evaluateServiceInterval({
      intervalKm: 10000,
      intervalMonths: 12,
      lastServiceOdometerKm: 40000,
      lastServiceDate: '2024-12-01',
      currentOdometerKm: 41000,
      now: NOW,
    });
    expect(result.status).toBe('overdue');
    expect(result.triggeredBy).toBe('date');
  });

  it('handles an odometer that appears to roll back (used-car correction) without going negative-urgent', () => {
    const result = evaluateServiceInterval({
      intervalKm: 10000,
      intervalMonths: null,
      lastServiceOdometerKm: 90000,
      lastServiceDate: null,
      currentOdometerKm: 20000, // odometer replaced/corrected below last recorded service
      now: NOW,
    });
    expect(result.status).toBe('ok');
    expect(result.remainingKm).toBe(80000);
  });

  it('treats simultaneous overdue-by-both as overdue and picks the more overdue basis', () => {
    const result = evaluateServiceInterval({
      intervalKm: 10000,
      intervalMonths: 12,
      lastServiceOdometerKm: 40000,
      lastServiceDate: '2024-01-01',
      currentOdometerKm: 50100, // only 100km over the 50,000 km due point
      now: NOW, // ~1 year over on date basis
    });
    expect(result.status).toBe('overdue');
    // km is barely overdue (-100) vs date being wildly overdue -> km is the "closer to zero" basis
    expect(result.triggeredBy).toBe('km');
  });
});

describe('sortByUrgency', () => {
  it('ranks overdue before due-soon before ok before unknown', () => {
    const items = [
      { id: 'ok', evaluation: evaluateServiceInterval({ intervalKm: 10000, intervalMonths: null, lastServiceOdometerKm: 0, lastServiceDate: null, currentOdometerKm: 1000, now: NOW }) },
      { id: 'unknown', evaluation: evaluateServiceInterval({ intervalKm: null, intervalMonths: null, lastServiceOdometerKm: null, lastServiceDate: null, currentOdometerKm: 1000, now: NOW }) },
      { id: 'overdue', evaluation: evaluateServiceInterval({ intervalKm: 10000, intervalMonths: null, lastServiceOdometerKm: 0, lastServiceDate: null, currentOdometerKm: 15000, now: NOW }) },
      { id: 'due-soon', evaluation: evaluateServiceInterval({ intervalKm: 10000, intervalMonths: null, lastServiceOdometerKm: 0, lastServiceDate: null, currentOdometerKm: 9800, now: NOW }) },
    ];
    const sorted = sortByUrgency(items);
    expect(sorted.map((i) => i.id)).toEqual(['overdue', 'due-soon', 'ok', 'unknown']);
  });
});
