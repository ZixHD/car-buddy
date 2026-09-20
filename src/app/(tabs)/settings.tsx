import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { resetAllData } from '@/db/repositories/reset';
import { type DefaultCurrency, useSettingsStore } from '@/stores/useSettingsStore';
import { type AppLanguage } from '@/i18n/detectLocale';

const LANGUAGES: { value: AppLanguage; labelKey: string }[] = [
  { value: 'en', labelKey: 'settings.languageEnglish' },
  { value: 'sr', labelKey: 'settings.languageSerbian' },
];

const CURRENCIES: DefaultCurrency[] = ['RSD', 'EUR', 'USD'];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { language, defaultCurrency, setLanguage, setDefaultCurrency } = useSettingsStore();

  function confirmReset() {
    Alert.alert(t('settings.resetConfirmTitle'), t('settings.resetConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await resetAllData();
          queryClient.invalidateQueries();
        },
      },
    ]);
  }

  return (
    <ScreenContainer>
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</Text>

      <Card className="gap-3">
        <Text className="font-semibold text-gray-900 dark:text-white">{t('settings.language')}</Text>
        <View className="flex-row gap-2">
          {LANGUAGES.map((option) => {
            const selected = option.value === language;
            return (
              <Button
                key={option.value}
                label={t(option.labelKey)}
                variant={selected ? 'primary' : 'secondary'}
                onPress={() => setLanguage(option.value)}
              />
            );
          })}
        </View>
      </Card>

      <Card className="gap-3">
        <Text className="font-semibold text-gray-900 dark:text-white">{t('settings.defaultCurrency')}</Text>
        <View className="flex-row gap-2">
          {CURRENCIES.map((currency) => {
            const selected = currency === defaultCurrency;
            return (
              <Button
                key={currency}
                label={currency}
                variant={selected ? 'primary' : 'secondary'}
                onPress={() => setDefaultCurrency(currency)}
              />
            );
          })}
        </View>
      </Card>

      <Card className="gap-2">
        <Text className="font-semibold text-gray-900 dark:text-white">{t('settings.about')}</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-300">{t('settings.aboutBody')}</Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {t('settings.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
        </Text>
      </Card>

      <Button label={t('settings.resetAllData')} variant="destructive" onPress={confirmReset} />
    </ScreenContainer>
  );
}
