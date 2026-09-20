import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import { type VehicleFormValues, VehicleForm, valuesToInput } from '@/components/forms/VehicleForm';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { type Vehicle } from '@/db/schema';
import { useUpdateVehicle, useVehicle } from '@/hooks/useVehicles';

function vehicleToFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    nickname: vehicle.nickname,
    make: vehicle.make,
    model: vehicle.model,
    year: String(vehicle.year),
    fuelType: vehicle.fuelType,
    transmission: vehicle.transmission ?? 'manual',
    engineDisplacementL: vehicle.engineDisplacementL != null ? String(vehicle.engineDisplacementL) : '',
    enginePowerHp: vehicle.enginePowerHp != null ? String(vehicle.enginePowerHp) : '',
    vin: vehicle.vin ?? '',
    plate: vehicle.plate ?? '',
    currentOdometerKm: String(vehicle.currentOdometerKm),
    purchaseDate: vehicle.purchaseDate,
    registrationExpiry: vehicle.registrationExpiry,
    insuranceExpiry: vehicle.insuranceExpiry,
  };
}

export default function EditVehicleScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: vehicle, isLoading } = useVehicle(id);
  const updateVehicle = useUpdateVehicle(id);

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: t('vehicleForm.editTitle') }} />
      {isLoading || !vehicle ? (
        <ActivityIndicator className="mt-12" />
      ) : (
        <VehicleForm
          initialValues={vehicleToFormValues(vehicle)}
          submitLabel={t('common.save')}
          submitting={updateVehicle.isPending}
          onSubmit={(values) => {
            updateVehicle.mutate(valuesToInput(values), {
              onSuccess: () => router.back(),
            });
          }}
        />
      )}
    </ScreenContainer>
  );
}
