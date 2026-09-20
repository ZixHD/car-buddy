import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { useDashboard } from '@/hooks/useDashboard';
import { formatDueMessage, statusToTone } from '@/lib/intervalDisplay';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator className="mt-12" />
      </ScreenContainer>
    );
  }

  const vehicles = data?.vehicles ?? [];
  const dueItems = data?.dueItems ?? [];

  if (vehicles.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState icon="car-sport-outline" title={t('dashboard.noVehicles')} body={t('dashboard.addFirstVehicle')} />
        <Button label={t('dashboard.addVehicle')} onPress={() => router.push('/vehicle/new')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="gap-2">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">{t('dashboard.dueSoonSection')}</Text>
        {dueItems.length === 0 ? (
          <Card>
            <Text className="text-gray-600 dark:text-gray-300">{t('dashboard.allCaughtUp')}</Text>
          </Card>
        ) : (
          dueItems.map((item) => (
            <Pressable
              key={`${item.vehicle.id}-${item.intervalId}`}
              onPress={() => router.push(`/vehicle/${item.vehicle.id}`)}>
              <Card className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-gray-900 dark:text-white">{item.vehicle.nickname}</Text>
                  <SeverityBadge tone={statusToTone(item.evaluation.status)} label={formatDueMessage(t, item.evaluation)} />
                </View>
                <Text className="text-sm text-gray-600 dark:text-gray-300">{item.label}</Text>
              </Card>
            </Pressable>
          ))
        )}
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">{t('dashboard.yourVehicles')}</Text>
          <Pressable onPress={() => router.push('/vehicle/new')} className="flex-row items-center gap-1">
            <Ionicons name="add-circle" size={20} color="#2563eb" />
            <Text className="font-semibold text-blue-600">{t('garage.addVehicle')}</Text>
          </Pressable>
        </View>
        {vehicles.map((vehicle) => (
          <Pressable key={vehicle.id} onPress={() => router.push(`/vehicle/${vehicle.id}`)}>
            <Card className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold text-gray-900 dark:text-white">{vehicle.nickname}</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {t('garage.vehicleYearMakeModel', { year: vehicle.year, make: vehicle.make, model: vehicle.model })}
                </Text>
              </View>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {t('common.kmValue', { value: vehicle.currentOdometerKm.toLocaleString() })}
              </Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}
