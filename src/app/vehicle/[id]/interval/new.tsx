import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/SelectField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { type ServiceIntervalType } from '@/db/schema';
import { useCreateServiceInterval } from '@/hooks/useServiceIntervals';

export default function AddServiceIntervalScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const createInterval = useCreateServiceInterval(id);

  const [type, setType] = useState<ServiceIntervalType>('custom');
  const [label, setLabel] = useState('');
  const [intervalKm, setIntervalKm] = useState('');
  const [intervalMonths, setIntervalMonths] = useState('');

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: t('intervals.addTitle') }} />
      <View className="gap-4">
        <SelectField
          label={t('intervals.type')}
          value={type}
          onChange={setType}
          options={[
            { value: 'small', label: t('intervals.type_small') },
            { value: 'big', label: t('intervals.type_big') },
            { value: 'yearly', label: t('intervals.type_yearly') },
            { value: 'custom', label: t('intervals.type_custom') },
          ]}
        />
        <TextField label={t('intervals.label')} value={label} onChangeText={setLabel} />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField
              label={`${t('intervals.intervalKm')} (${t('common.optional')})`}
              value={intervalKm}
              onChangeText={setIntervalKm}
              keyboardType="number-pad"
            />
          </View>
          <View className="flex-1">
            <TextField
              label={`${t('intervals.intervalMonths')} (${t('common.optional')})`}
              value={intervalMonths}
              onChangeText={setIntervalMonths}
              keyboardType="number-pad"
            />
          </View>
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400">{t('intervals.intervalHint')}</Text>
        <Button
          label={t('common.save')}
          loading={createInterval.isPending}
          onPress={() => {
            if (!label.trim() || (!intervalKm && !intervalMonths)) return;
            createInterval.mutate(
              {
                type,
                label: label.trim(),
                intervalKm: intervalKm ? Number(intervalKm) : null,
                intervalMonths: intervalMonths ? Number(intervalMonths) : null,
                lastServiceOdometerKm: null,
                lastServiceDate: null,
                enabled: true,
              },
              { onSuccess: () => router.back() },
            );
          }}
        />
      </View>
    </ScreenContainer>
  );
}
