import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { SelectField } from '@/components/ui/SelectField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { type ServiceIntervalType, type Currency } from '@/db/schema';
import { useCreateServiceRecord } from '@/hooks/useServiceRecords';
import { useVehicle } from '@/hooks/useVehicles';
import { useSettingsStore } from '@/stores/useSettingsStore';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddServiceRecordScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: vehicle } = useVehicle(id);
  const defaultCurrency = useSettingsStore((s) => s.defaultCurrency);
  const createRecord = useCreateServiceRecord(id);

  const [type, setType] = useState<ServiceIntervalType>('custom');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(today());
  const [odometerKm, setOdometerKm] = useState(vehicle ? String(vehicle.currentOdometerKm) : '');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: t('serviceRecords.addTitle') }} />
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
        <TextField label={t('serviceRecords.description')} value={description} onChangeText={setDescription} />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <DateField label={t('serviceRecords.date')} value={date} onChange={setDate} />
          </View>
          <View className="flex-1">
            <TextField
              label={t('serviceRecords.odometerAtService')}
              value={odometerKm}
              onChangeText={setOdometerKm}
              keyboardType="number-pad"
            />
          </View>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField
              label={`${t('serviceRecords.cost')} (${t('common.optional')})`}
              value={cost}
              onChangeText={setCost}
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1">
            <SelectField
              label={t('serviceRecords.currency')}
              value={currency}
              onChange={setCurrency}
              options={[
                { value: 'RSD', label: 'RSD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'USD', label: 'USD' },
              ]}
            />
          </View>
        </View>
        <TextField
          label={`${t('serviceRecords.location')} (${t('common.optional')})`}
          value={location}
          onChangeText={setLocation}
        />
        <TextField
          label={`${t('serviceRecords.notes')} (${t('common.optional')})`}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <Button
          label={t('common.save')}
          loading={createRecord.isPending}
          onPress={() => {
            if (!description.trim() || !odometerKm) return;
            createRecord.mutate(
              {
                type,
                description: description.trim(),
                date,
                odometerKm: Number(odometerKm) || 0,
                cost: cost ? Number(cost) : null,
                currency,
                location: location.trim() || null,
                notes: notes.trim() || null,
                receiptUri: null,
              },
              { onSuccess: () => router.back() },
            );
          }}
        />
      </View>
    </ScreenContainer>
  );
}
