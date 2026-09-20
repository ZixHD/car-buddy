import { Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { VehicleForm, valuesToInput } from '@/components/forms/VehicleForm';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useCreateVehicle } from '@/hooks/useVehicles';

export default function NewVehicleScreen() {
  const { t } = useTranslation();
  const createVehicle = useCreateVehicle();

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: t('vehicleForm.addTitle') }} />
      <VehicleForm
        submitLabel={t('common.save')}
        submitting={createVehicle.isPending}
        onSubmit={(values) => {
          createVehicle.mutate(valuesToInput(values), {
            onSuccess: (vehicle) => router.replace(`/vehicle/${vehicle.id}`),
          });
        }}
      />
    </ScreenContainer>
  );
}
