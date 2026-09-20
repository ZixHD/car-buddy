import { SeedDtcLookupService } from './SeedDtcLookupService';

describe('SeedDtcLookupService', () => {
  const service = new SeedDtcLookupService();

  it('finds a known code and returns localized text', () => {
    const en = service.lookup('P0420', 'en');
    const sr = service.lookup('P0420', 'sr');
    expect(en?.severity).toBe('soon');
    expect(en?.name).toMatch(/catalytic/i);
    expect(sr?.name).toMatch(/katalizatora/i);
  });

  it('is case-insensitive on the code', () => {
    expect(service.lookup('p0420', 'en')?.code).toBe('P0420');
  });

  it('returns null for an unknown code instead of throwing', () => {
    expect(service.lookup('P9999', 'en')).toBeNull();
  });

  it('every seeded entry has both locales and a valid cost range', () => {
    const all = service.listAll('en');
    expect(all.length).toBeGreaterThan(0);
    for (const entry of all) {
      expect(entry.costMinEur).toBeLessThanOrEqual(entry.costMaxEur);
      expect(['safe', 'soon', 'stop']).toContain(entry.severity);
      const srVersion = service.lookup(entry.code, 'sr');
      expect(srVersion?.name.length).toBeGreaterThan(0);
    }
  });
});
