import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type AppLanguage, detectDefaultLanguage } from '@/i18n/detectLocale';
import i18n from '@/i18n/index';

export type { AppLanguage };
export type DefaultCurrency = 'RSD' | 'EUR' | 'USD';

interface SettingsState {
  language: AppLanguage;
  defaultCurrency: DefaultCurrency;
  setLanguage: (language: AppLanguage) => void;
  setDefaultCurrency: (currency: DefaultCurrency) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: detectDefaultLanguage(),
      defaultCurrency: 'RSD',
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
      setDefaultCurrency: (defaultCurrency) => set({ defaultCurrency }),
    }),
    {
      name: 'car-buddy-settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) i18n.changeLanguage(state.language);
      },
    },
  ),
);
