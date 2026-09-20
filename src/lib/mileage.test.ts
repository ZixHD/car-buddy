import { averageKmPerMonth } from './mileage';

describe('averageKmPerMonth', () => {
  it('returns null with fewer than two readings', () => {
    expect(averageKmPerMonth([])).toBeNull();
    expect(averageKmPerMonth([{ valueKm: 1000, date: '2026-01-01' }])).toBeNull();
  });

  it('computes average km/month between the earliest and latest reading, regardless of input order', () => {
    const readings = [
      { valueKm: 11000, date: '2026-02-01' },
      { valueKm: 10000, date: '2026-01-01' },
    ];
    // 1000km over 31 days (Jan 1 -> Feb 1) ≈ 1.018 months
    expect(averageKmPerMonth(readings)).toBe(982);
  });

  it('returns null when the readings span zero or negative days', () => {
    expect(
      averageKmPerMonth([
        { valueKm: 1000, date: '2026-01-01' },
        { valueKm: 1000, date: '2026-01-01' },
      ]),
    ).toBeNull();
  });
});
