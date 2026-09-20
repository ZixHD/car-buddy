export type DtcSeverity = 'safe' | 'soon' | 'stop';
export type SupportedLocale = 'en' | 'sr';

export interface DtcInfo {
  code: string;
  severity: DtcSeverity;
  name: string;
  meaning: string;
  ignoreConsequence: string;
  costMinEur: number;
  costMaxEur: number;
}

export interface DtcLookupService {
  lookup(code: string, locale: SupportedLocale): DtcInfo | null;
  listAll(locale: SupportedLocale): DtcInfo[];
}
