import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type CreateServiceRecordInput,
  createServiceRecord,
  deleteServiceRecord,
  listServiceRecords,
} from '@/db/repositories/serviceRecords';

export const serviceRecordsQueryKey = (vehicleId: string) => ['serviceRecords', vehicleId] as const;

export function useServiceRecords(vehicleId: string | undefined) {
  return useQuery({
    queryKey: serviceRecordsQueryKey(vehicleId ?? ''),
    queryFn: () => listServiceRecords(vehicleId!),
    enabled: !!vehicleId,
  });
}

export function useCreateServiceRecord(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateServiceRecordInput, 'vehicleId'>) =>
      createServiceRecord({ ...input, vehicleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceRecordsQueryKey(vehicleId) });
    },
  });
}

export function useDeleteServiceRecord(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteServiceRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceRecordsQueryKey(vehicleId) });
    },
  });
}
