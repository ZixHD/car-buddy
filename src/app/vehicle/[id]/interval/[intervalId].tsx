import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/SelectField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { type ServiceIntervalType } from '@/db/schema';
import { useDeleteServiceInterval, useServiceIntervals, useUpdateServiceInterval } from '@/hooks/useServiceIntervals';

export default function EditServiceIntervalScreen() {
  const { t } = useTranslation();
  const { id, intervalId } = useLocalSearchParams<{ id: string; intervalId: string }>();
  const { data: intervals, isLoading } = useServiceIntervals(id);
  const updateInterval = useUpdateServiceInterval(id);
  const deleteInterval = useDeleteServiceInterval(id);

  const found = intervals?.find((item) => item.interval.id === intervalId)?.interval;

  const [type, setType] = useState<ServiceIntervalType>('custom');
  const [label, setLabel] = useState('');
  const [intervalKm, setIntervalKm] = useState('');
  const [intervalMonths, setIntervalMonths] = useState('');

  useEffect(() => {
    if (found) {
      setType(found.type);
      setLabel(found.label);
      setIntervalKm(found.intervalKm != null ? String(found.intervalKm) : '');
      setIntervalMonths(found.intervalMonths != null ? String(found.intervalMonths) : '');
    }
  }, [found]);

  function confirmDelete() {
    Alert.alert(t('common.confirmDeleteTitle'), t('common.confirmDeleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => deleteInterval.mutate(intervalId, { onSuccess: () => router.back() }),
      },
    ]);
  }

  if (isLoading || !found) {
    return (
      <ScreenContainer>
        <ActivityIndicator className="mt-12" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: t('intervals.editTitle') }} />
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
        {found.lastServiceDate || found.lastServiceOdometerKm != null ? (
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {t('intervals.lastServiceAt', {
              km: (found.lastServiceOdometerKm ?? 0).toLocaleString(),
              date: found.lastServiceDate ?? t('common.unknown'),
            })}
          </Text>
        ) : null}
        <Button
          label={t('common.save')}
          loading={updateInterval.isPending}
          onPress={() => {
            if (!label.trim() || (!intervalKm && !intervalMonths)) return;
            updateInterval.mutate(
              {
                id: intervalId,
                patch: {
                  type,
                  label: label.trim(),
                  intervalKm: intervalKm ? Number(intervalKm) : null,
                  intervalMonths: intervalMonths ? Number(intervalMonths) : null,
                },
              },
              { onSuccess: () => router.back() },
            );
          }}
        />
        <Button label={t('common.delete')} variant="destructive" loading={deleteInterval.isPending} onPress={confirmDelete} />
      </View>
    </ScreenContainer>
  );
}
