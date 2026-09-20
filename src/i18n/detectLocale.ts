import * as Localization from 'expo-localization';

export type AppLanguage = 'en' | 'sr';

const SUPPORTED_LANGUAGES: AppLanguage[] = ['en', 'sr'];

export function detectDefaultLanguage(): AppLanguage {
  const deviceLanguageCode = Localization.getLocales()[0]?.languageCode;
  return SUPPORTED_LANGUAGES.includes(deviceLanguageCode as AppLanguage) ? (deviceLanguageCode as AppLanguage) : 'en';
}
