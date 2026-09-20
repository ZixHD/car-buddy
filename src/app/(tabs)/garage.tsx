import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useVehicles } from '@/hooks/useVehicles';

export default function GarageScreen() {
  const { t } = useTranslation();
  const { data: vehicles, isLoading } = useVehicles();

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">{t('garage.title')}</Text>
        <Pressable
          onPress={() => router.push('/vehicle/new')}
          className="flex-row items-center gap-1 rounded-full bg-blue-600 px-3 py-2">
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="font-semibold text-white">{t('garage.addVehicle')}</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-12" />
      ) : !vehicles || vehicles.length === 0 ? (
        <EmptyState icon="car-sport-outline" title={t('garage.emptyTitle')} body={t('garage.emptyBody')} />
      ) : (
        vehicles.map((vehicle) => (
          <Pressable key={vehicle.id} onPress={() => router.push(`/vehicle/${vehicle.id}`)}>
            <Card className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">{vehicle.nickname}</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {t('garage.vehicleYearMakeModel', { year: vehicle.year, make: vehicle.make, model: vehicle.model })}
                </Text>
                {vehicle.plate ? (
                  <Text className="text-xs text-gray-400 dark:text-gray-500">{vehicle.plate}</Text>
                ) : null}
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {t('common.kmValue', { value: vehicle.currentOdometerKm.toLocaleString() })}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </ScreenContainer>
  );
}
