import dtcSeedData from '@/db/seed/dtc-codes.json';
import type { DtcInfo, DtcLookupService, DtcSeverity, SupportedLocale } from './types';

interface RawDtcEntry {
  code: string;
  severity: DtcSeverity;
  costMinEur: number;
  costMaxEur: number;
  en: { name: string; meaning: string; ignoreConsequence: string };
  sr: { name: string; meaning: string; ignoreConsequence: string };
}

const RAW_ENTRIES = dtcSeedData as RawDtcEntry[];

function toDtcInfo(entry: RawDtcEntry, locale: SupportedLocale): DtcInfo {
  const text = entry[locale] ?? entry.en;
  return {
    code: entry.code,
    severity: entry.severity,
    costMinEur: entry.costMinEur,
    costMaxEur: entry.costMaxEur,
    name: text.name,
    meaning: text.meaning,
    ignoreConsequence: text.ignoreConsequence,
  };
}

/**
 * Looks up DTCs against the bundled seed dataset (src/db/seed/dtc-codes.json).
 * Swappable behind DtcLookupService so a future LLM-backed or remote-API
 * implementation can plug in without touching UI code (see PLAN.md, Phase 3).
 */
export class SeedDtcLookupService implements DtcLookupService {
  private readonly byCode = new Map<string, RawDtcEntry>(RAW_ENTRIES.map((entry) => [entry.code, entry]));

  lookup(code: string, locale: SupportedLocale): DtcInfo | null {
    const entry = this.byCode.get(code.toUpperCase());
    return entry ? toDtcInfo(entry, locale) : null;
  }

  listAll(locale: SupportedLocale): DtcInfo[] {
    return RAW_ENTRIES.map((entry) => toDtcInfo(entry, locale));
  }
}

export const dtcLookupService: DtcLookupService = new SeedDtcLookupService();
