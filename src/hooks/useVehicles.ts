import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type CreateVehicleInput,
  type UpdateVehicleInput,
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
} from '@/db/repositories/vehicles';
import { seedDefaultServiceIntervals } from '@/db/repositories/serviceIntervals';

export const vehiclesQueryKey = ['vehicles'] as const;
export const vehicleQueryKey = (id: string) => ['vehicle', id] as const;

export function useVehicles() {
  return useQuery({ queryKey: vehiclesQueryKey, queryFn: listVehicles });
}

export function useVehicle(id: string | undefined) {
  return useQuery({
    queryKey: vehicleQueryKey(id ?? ''),
    queryFn: () => getVehicle(id!),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateVehicleInput) => {
      const vehicle = await createVehicle(input);
      await seedDefaultServiceIntervals(vehicle.id);
      return vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
    },
  });
}

export function useUpdateVehicle(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateVehicleInput) => updateVehicle(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
      queryClient.invalidateQueries({ queryKey: vehicleQueryKey(id) });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
    },
  });
}
