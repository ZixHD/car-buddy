import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getVehicle } from '@/db/repositories/vehicles';
import {
  type CreateServiceIntervalInput,
  type MarkServiceDoneInput,
  type UpdateServiceIntervalInput,
  createServiceInterval,
  deleteServiceInterval,
  listServiceIntervals,
  markServiceDone,
  updateServiceInterval,
} from '@/db/repositories/serviceIntervals';
import { type ServiceInterval } from '@/db/schema';
import { type IntervalEvaluation, evaluateServiceInterval, sortByUrgency } from '@/domain/interval-engine';
import { dashboardQueryKey } from '@/hooks/useDashboard';
import { serviceRecordsQueryKey } from '@/hooks/useServiceRecords';

export const serviceIntervalsQueryKey = (vehicleId: string) => ['serviceIntervals', vehicleId] as const;

export interface EvaluatedServiceInterval {
  interval: ServiceInterval;
  evaluation: IntervalEvaluation;
}

async function fetchEvaluatedIntervals(vehicleId: string): Promise<EvaluatedServiceInterval[]> {
  const [vehicle, intervals] = await Promise.all([getVehicle(vehicleId), listServiceIntervals(vehicleId)]);
  if (!vehicle) return [];

  const evaluated = intervals
    .filter((interval) => interval.enabled)
    .map((interval) => ({
      interval,
      evaluation: evaluateServiceInterval({
        intervalKm: interval.intervalKm,
        intervalMonths: interval.intervalMonths,
        lastServiceOdometerKm: interval.lastServiceOdometerKm,
        lastServiceDate: interval.lastServiceDate,
        currentOdometerKm: vehicle.currentOdometerKm,
      }),
    }));

  return sortByUrgency(evaluated.map((e) => ({ id: e.interval.id, evaluation: e.evaluation }))).map(
    (ranked) => evaluated.find((e) => e.interval.id === ranked.id)!,
  );
}

export function useServiceIntervals(vehicleId: string | undefined) {
  return useQuery({
    queryKey: serviceIntervalsQueryKey(vehicleId ?? ''),
    queryFn: () => fetchEvaluatedIntervals(vehicleId!),
    enabled: !!vehicleId,
  });
}

function invalidateIntervalDependents(queryClient: ReturnType<typeof useQueryClient>, vehicleId: string) {
  queryClient.invalidateQueries({ queryKey: serviceIntervalsQueryKey(vehicleId) });
  queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
}

export function useCreateServiceInterval(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateServiceIntervalInput, 'vehicleId'>) =>
      createServiceInterval({ ...input, vehicleId }),
    onSuccess: () => invalidateIntervalDependents(queryClient, vehicleId),
  });
}

export function useUpdateServiceInterval(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateServiceIntervalInput }) =>
      updateServiceInterval(id, patch),
    onSuccess: () => invalidateIntervalDependents(queryClient, vehicleId),
  });
}

export function useDeleteServiceInterval(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteServiceInterval(id),
    onSuccess: () => invalidateIntervalDependents(queryClient, vehicleId),
  });
}

export function useMarkServiceDone(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ intervalId, input }: { intervalId: string; input?: MarkServiceDoneInput }) =>
      markServiceDone(intervalId, input),
    onSuccess: () => {
      invalidateIntervalDependents(queryClient, vehicleId);
      queryClient.invalidateQueries({ queryKey: serviceRecordsQueryKey(vehicleId) });
    },
  });
}
