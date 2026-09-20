import { useQuery } from '@tanstack/react-query';

import { listServiceIntervals } from '@/db/repositories/serviceIntervals';
import { listVehicles } from '@/db/repositories/vehicles';
import { type Vehicle } from '@/db/schema';
import { type IntervalEvaluation, evaluateServiceInterval, sortByUrgency } from '@/domain/interval-engine';

export const dashboardQueryKey = ['dashboard'] as const;

export interface DashboardDueItem {
  vehicle: Vehicle;
  intervalId: string;
  label: string;
  evaluation: IntervalEvaluation;
}

export interface DashboardData {
  vehicles: Vehicle[];
  dueItems: DashboardDueItem[];
}

async function fetchDashboard(): Promise<DashboardData> {
  const vehicles = await listVehicles();

  const perVehicleIntervals = await Promise.all(
    vehicles.map(async (vehicle) => {
      const intervals = await listServiceIntervals(vehicle.id);
      return intervals
        .filter((interval) => interval.enabled)
        .map((interval) => ({
          vehicle,
          intervalId: interval.id,
          label: interval.label,
          evaluation: evaluateServiceInterval({
            intervalKm: interval.intervalKm,
            intervalMonths: interval.intervalMonths,
            lastServiceOdometerKm: interval.lastServiceOdometerKm,
            lastServiceDate: interval.lastServiceDate,
            currentOdometerKm: vehicle.currentOdometerKm,
          }),
        }));
    }),
  );

  const flat = perVehicleIntervals.flat();
  const ranked = sortByUrgency(flat.map((item) => ({ id: item.intervalId, evaluation: item.evaluation })));
  const dueItems = ranked
    .map((r) => flat.find((item) => item.intervalId === r.id)!)
    .filter((item) => item.evaluation.status === 'overdue' || item.evaluation.status === 'due-soon');

  return { vehicles, dueItems };
}

export function useDashboard() {
  return useQuery({ queryKey: dashboardQueryKey, queryFn: fetchDashboard });
}
