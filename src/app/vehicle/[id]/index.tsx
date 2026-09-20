import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { useOdometerReadings } from '@/hooks/useOdometerReadings';
import { useMarkServiceDone, useServiceIntervals } from '@/hooks/useServiceIntervals';
import { useServiceRecords } from '@/hooks/useServiceRecords';
import { useDeleteVehicle, useVehicle } from '@/hooks/useVehicles';
import { formatDueMessage, statusToTone } from '@/lib/intervalDisplay';
import { averageKmPerMonth } from '@/lib/mileage';
import { useActiveVehicleStore } from '@/stores/useActiveVehicleStore';

export default function VehicleDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: vehicle, isLoading } = useVehicle(id);
  const { data: intervals } = useServiceIntervals(id);
  const { data: readings } = useOdometerReadings(id);
  const { data: records } = useServiceRecords(id);
  const markServiceDone = useMarkServiceDone(id);
  const deleteVehicle = useDeleteVehicle();
  const setActiveVehicleId = useActiveVehicleStore((s) => s.setActiveVehicleId);

  if (isLoading || !vehicle) {
    return (
      <ScreenContainer>
        <ActivityIndicator className="mt-12" />
      </ScreenContainer>
    );
  }

  const avgPerMonth = averageKmPerMonth(readings ?? []);

  function confirmMarkDone(intervalId: string, label: string) {
    Alert.alert(t('intervals.markDoneTitle', { label }), t('intervals.markDoneBody', { km: vehicle!.currentOdometerKm.toLocaleString() }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('intervals.markDone'), onPress: () => markServiceDone.mutate({ intervalId }) },
    ]);
  }

  function confirmDeleteVehicle() {
    Alert.alert(t('common.confirmDeleteTitle'), t('vehicleDetail.deleteConfirm', { nickname: vehicle!.nickname }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => deleteVehicle.mutate(vehicle!.id, { onSuccess: () => router.replace('/(tabs)/garage') }),
      },
    ]);
  }

  function goToHistory() {
    setActiveVehicleId(vehicle!.id);
    router.push('/(tabs)/history');
  }

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          title: vehicle.nickname,
          headerRight: () => (
            <Pressable onPress={() => router.push(`/vehicle/${vehicle.id}/edit`)}>
              <Ionicons name="create-outline" size={22} />
            </Pressable>
          ),
        }}
      />

      <Card className="gap-1">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          {t('garage.vehicleYearMakeModel', { year: vehicle.year, make: vehicle.make, model: vehicle.model })}
        </Text>
        <View className="mt-2 flex-row flex-wrap gap-x-6 gap-y-2">
          <Spec label={t('vehicleForm.fuelType')} value={t(`vehicleForm.fuel.${vehicle.fuelType}`)} />
          {vehicle.transmission ? (
            <Spec label={t('vehicleForm.transmission')} value={t(`vehicleForm.transmissionType.${vehicle.transmission}`)} />
          ) : null}
          {vehicle.engineDisplacementL ? <Spec label={t('vehicleForm.engineDisplacement')} value={`${vehicle.engineDisplacementL} L`} /> : null}
          {vehicle.enginePowerHp ? <Spec label={t('vehicleForm.enginePower')} value={`${vehicle.enginePowerHp} hp`} /> : null}
          {vehicle.plate ? <Spec label={t('vehicleForm.plate')} value={vehicle.plate} /> : null}
          {vehicle.vin ? <Spec label={t('vehicleForm.vin')} value={vehicle.vin} /> : null}
          {vehicle.registrationExpiry ? <Spec label={t('vehicleForm.registrationExpiry')} value={vehicle.registrationExpiry} /> : null}
          {vehicle.insuranceExpiry ? <Spec label={t('vehicleForm.insuranceExpiry')} value={vehicle.insuranceExpiry} /> : null}
        </View>
      </Card>

      <View className="gap-2">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">{t('vehicleDetail.mileageSection')}</Text>
        <Card className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('common.kmValue', { value: vehicle.currentOdometerKm.toLocaleString() })}
            </Text>
            {avgPerMonth != null ? (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {t('odometer.averagePerMonth', { value: avgPerMonth.toLocaleString() })}
              </Text>
            ) : null}
          </View>
          <Button label={t('vehicleDetail.addReading')} onPress={() => router.push(`/vehicle/${vehicle.id}/odometer/new`)} />
        </Card>
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">{t('vehicleDetail.intervalsSection')}</Text>
          <Pressable onPress={() => router.push(`/vehicle/${vehicle.id}/interval/new`)} className="flex-row items-center gap-1">
            <Ionicons name="add-circle" size={20} color="#2563eb" />
            <Text className="font-semibold text-blue-600">{t('vehicleDetail.addInterval')}</Text>
          </Pressable>
        </View>
        {!intervals || intervals.length === 0 ? (
          <Card>
            <Text className="text-gray-500 dark:text-gray-400">{t('vehicleDetail.noIntervals')}</Text>
          </Card>
        ) : (
          intervals.map(({ interval, evaluation }) => (
            <Pressable key={interval.id} onPress={() => router.push(`/vehicle/${vehicle.id}/interval/${interval.id}`)}>
              <Card className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900 dark:text-white">{interval.label}</Text>
                  <SeverityBadge tone={statusToTone(evaluation.status)} label={formatDueMessage(t, evaluation)} />
                </View>
                <Button
                  label={t('intervals.markDone')}
                  variant="secondary"
                  loading={markServiceDone.isPending}
                  onPress={() => confirmMarkDone(interval.id, interval.label)}
                />
              </Card>
            </Pressable>
          ))
        )}
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">{t('vehicleDetail.historySection')}</Text>
          <Pressable onPress={goToHistory}>
            <Text className="font-semibold text-blue-600">{t('vehicleDetail.viewAll')}</Text>
          </Pressable>
        </View>
        {!records || records.length === 0 ? (
          <Card>
            <Text className="text-gray-500 dark:text-gray-400">{t('serviceRecords.emptyBody')}</Text>
          </Card>
        ) : (
          records.slice(0, 3).map((record) => (
            <Card key={record.id} className="gap-1">
              <Text className="font-semibold text-gray-900 dark:text-white">{record.description}</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {record.date} · {record.odometerKm.toLocaleString()} km
                {record.cost != null ? ` · ${record.cost.toLocaleString()} ${record.currency}` : ''}
              </Text>
            </Card>
          ))
        )}
        <Button label={t('serviceRecords.addTitle')} variant="secondary" onPress={() => router.push(`/vehicle/${vehicle.id}/service/new`)} />
      </View>

      <Button label={t('vehicleDetail.deleteVehicle')} variant="destructive" onPress={confirmDeleteVehicle} />
    </ScreenContainer>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[40%] gap-0.5">
      <Text className="text-xs text-gray-500 dark:text-gray-400">{label}</Text>
      <Text className="text-sm font-medium text-gray-900 dark:text-white">{value}</Text>
    </View>
  );
}
