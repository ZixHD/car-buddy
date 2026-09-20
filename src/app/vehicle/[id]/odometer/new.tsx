import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { useAddOdometerReading } from '@/hooks/useOdometerReadings';
import { useVehicle } from '@/hooks/useVehicles';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddOdometerReadingScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: vehicle } = useVehicle(id);
  const addReading = useAddOdometerReading(id);

  const [value, setValue] = useState(vehicle ? String(vehicle.currentOdometerKm) : '');
  const [date, setDate] = useState(today());

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: t('odometer.addTitle') }} />
      <View className="gap-4">
        <TextField
          label={t('odometer.valueLabel')}
          value={value}
          onChangeText={setValue}
          keyboardType="number-pad"
        />
        <DateField label={t('odometer.dateLabel')} value={date} onChange={setDate} />
        <Button
          label={t('common.save')}
          loading={addReading.isPending}
          onPress={() => {
            const valueKm = Number(value);
            if (!valueKm || valueKm < 0) return;
            addReading.mutate({ valueKm, date, source: 'manual' }, { onSuccess: () => router.back() });
          }}
        />
      </View>
    </ScreenContainer>
  );
}
