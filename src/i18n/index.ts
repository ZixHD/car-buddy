import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { detectDefaultLanguage } from './detectLocale';
import en from './en.json';
import sr from './sr.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sr: { translation: sr },
  },
  lng: detectDefaultLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
