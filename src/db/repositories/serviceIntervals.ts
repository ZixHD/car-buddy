import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import {
  type NewServiceInterval,
  type ServiceInterval,
  serviceIntervals,
  serviceRecords,
  vehicles,
} from '@/db/schema';
import { generateId } from '@/lib/id';

export async function listServiceIntervals(vehicleId: string): Promise<ServiceInterval[]> {
  return db.select().from(serviceIntervals).where(eq(serviceIntervals.vehicleId, vehicleId));
}

export type CreateServiceIntervalInput = Omit<NewServiceInterval, 'id'>;

export async function createServiceInterval(input: CreateServiceIntervalInput): Promise<ServiceInterval> {
  const [created] = await db
    .insert(serviceIntervals)
    .values({ ...input, id: generateId() })
    .returning();
  return created;
}

export type UpdateServiceIntervalInput = Partial<Omit<NewServiceInterval, 'id' | 'vehicleId'>>;

export async function updateServiceInterval(
  id: string,
  patch: UpdateServiceIntervalInput,
): Promise<ServiceInterval> {
  const [updated] = await db.update(serviceIntervals).set(patch).where(eq(serviceIntervals.id, id)).returning();
  return updated;
}

export async function deleteServiceInterval(id: string): Promise<void> {
  await db.delete(serviceIntervals).where(eq(serviceIntervals.id, id));
}

export interface MarkServiceDoneInput {
  cost?: number | null;
  currency?: 'RSD' | 'EUR' | 'USD';
  location?: string | null;
  notes?: string | null;
  /** Defaults to today. */
  date?: string;
}

/**
 * Logs a completed service to history and resets the interval's clock to the
 * vehicle's current odometer/today — the two effects the product spec requires
 * "marking a service done" to have, kept atomic in one repository call.
 */
export async function markServiceDone(intervalId: string, input: MarkServiceDoneInput = {}): Promise<void> {
  const [interval] = await db.select().from(serviceIntervals).where(eq(serviceIntervals.id, intervalId));
  if (!interval) throw new Error(`Service interval ${intervalId} not found`);

  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, interval.vehicleId));
  if (!vehicle) throw new Error(`Vehicle ${interval.vehicleId} not found`);

  const date = input.date ?? new Date().toISOString().slice(0, 10);

  await db.insert(serviceRecords).values({
    id: generateId(),
    vehicleId: interval.vehicleId,
    type: interval.type,
    description: interval.label,
    date,
    odometerKm: vehicle.currentOdometerKm,
    cost: input.cost ?? null,
    currency: input.currency ?? 'RSD',
    location: input.location ?? null,
    notes: input.notes ?? null,
    receiptUri: null,
  });

  await db
    .update(serviceIntervals)
    .set({ lastServiceOdometerKm: vehicle.currentOdometerKm, lastServiceDate: date })
    .where(eq(serviceIntervals.id, intervalId));
}

const DEFAULT_INTERVALS: Omit<CreateServiceIntervalInput, 'vehicleId'>[] = [
  {
    type: 'small',
    label: 'Small service (oil + filter)',
    intervalKm: 10000,
    intervalMonths: 12,
    lastServiceOdometerKm: null,
    lastServiceDate: null,
    enabled: true,
  },
  {
    type: 'big',
    label: 'Big service (belt, plugs, filters)',
    intervalKm: 60000,
    intervalMonths: 48,
    lastServiceOdometerKm: null,
    lastServiceDate: null,
    enabled: true,
  },
  {
    type: 'yearly',
    label: 'Registration / technical inspection',
    intervalKm: null,
    intervalMonths: 12,
    lastServiceOdometerKm: null,
    lastServiceDate: null,
    enabled: true,
  },
];

/** Seeds the three standard intervals for a newly created vehicle (all user-editable afterward). */
export async function seedDefaultServiceIntervals(vehicleId: string): Promise<void> {
  for (const defaults of DEFAULT_INTERVALS) {
    await createServiceInterval({ ...defaults, vehicleId });
  }
}
