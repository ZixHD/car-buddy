import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type CreateOdometerReadingInput,
  createOdometerReading,
  deleteOdometerReading,
  listOdometerReadings,
} from '@/db/repositories/odometer';
import { vehicleQueryKey, vehiclesQueryKey } from '@/hooks/useVehicles';

export const odometerReadingsQueryKey = (vehicleId: string) => ['odometerReadings', vehicleId] as const;

export function useOdometerReadings(vehicleId: string | undefined) {
  return useQuery({
    queryKey: odometerReadingsQueryKey(vehicleId ?? ''),
    queryFn: () => listOdometerReadings(vehicleId!),
    enabled: !!vehicleId,
  });
}

export function useAddOdometerReading(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateOdometerReadingInput, 'vehicleId'>) =>
      createOdometerReading({ ...input, vehicleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: odometerReadingsQueryKey(vehicleId) });
      // A new reading can change vehicles.currentOdometerKm, which every interval
      // evaluation and the vehicle list/detail screens depend on.
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
      queryClient.invalidateQueries({ queryKey: vehicleQueryKey(vehicleId) });
    },
  });
}

export function useDeleteOdometerReading(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOdometerReading(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: odometerReadingsQueryKey(vehicleId) });
    },
  });
}
