import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useServiceRecords } from '@/hooks/useServiceRecords';
import { useVehicles } from '@/hooks/useVehicles';
import { useActiveVehicleStore } from '@/stores/useActiveVehicleStore';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { data: vehicles } = useVehicles();
  const { activeVehicleId, setActiveVehicleId } = useActiveVehicleStore();

  useEffect(() => {
    if (!activeVehicleId && vehicles && vehicles.length > 0) {
      setActiveVehicleId(vehicles[0].id);
    }
  }, [activeVehicleId, vehicles, setActiveVehicleId]);

  const selectedVehicleId = activeVehicleId ?? vehicles?.[0]?.id;
  const { data: records, isLoading } = useServiceRecords(selectedVehicleId);

  const total = useMemo(() => {
    const totals = new Map<string, number>();
    for (const record of records ?? []) {
      if (record.cost == null) continue;
      totals.set(record.currency, (totals.get(record.currency) ?? 0) + record.cost);
    }
    return totals;
  }, [records]);

  if (!vehicles || vehicles.length === 0) {
    return (
      <ScreenContainer>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">{t('serviceRecords.title')}</Text>
        <EmptyState icon="receipt-outline" title={t('garage.emptyTitle')} body={t('garage.emptyBody')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">{t('serviceRecords.title')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
        <View className="flex-row gap-2">
          {vehicles.map((vehicle) => {
            const selected = vehicle.id === selectedVehicleId;
            return (
              <Pressable
                key={vehicle.id}
                onPress={() => setActiveVehicleId(vehicle.id)}
                className={`rounded-full px-4 py-2 ${selected ? 'bg-blue-600' : 'bg-gray-200 dark:bg-neutral-800'}`}>
                <Text className={selected ? 'font-semibold text-white' : 'text-gray-700 dark:text-gray-300'}>
                  {vehicle.nickname}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {selectedVehicleId ? (
        <Pressable
          onPress={() => router.push(`/vehicle/${selectedVehicleId}/service/new`)}
          className="flex-row items-center justify-center gap-1 self-start rounded-full bg-blue-600 px-4 py-2">
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="font-semibold text-white">{t('serviceRecords.addTitle')}</Text>
        </Pressable>
      ) : null}

      {total.size > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {Array.from(total.entries()).map(([currency, amount]) => (
            <View key={currency} className="rounded-xl bg-gray-100 px-3 py-1.5 dark:bg-neutral-800">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('serviceRecords.totalSpent', { amount: amount.toLocaleString(), currency })}
              </Text>
            </View>
          ))}
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator className="mt-8" />
      ) : !records || records.length === 0 ? (
        <EmptyState icon="document-text-outline" title={t('serviceRecords.emptyTitle')} body={t('serviceRecords.emptyBody')} />
      ) : (
        records.map((record) => (
          <Card key={record.id} className="gap-1">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-gray-900 dark:text-white">{record.description}</Text>
              {record.cost != null ? (
                <Text className="font-semibold text-gray-900 dark:text-white">
                  {record.cost.toLocaleString()} {record.currency}
                </Text>
              ) : null}
            </View>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {record.date} · {record.odometerKm.toLocaleString()} km
              {record.location ? ` · ${record.location}` : ''}
            </Text>
            {record.notes ? <Text className="text-sm text-gray-500 dark:text-gray-400">{record.notes}</Text> : null}
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}
