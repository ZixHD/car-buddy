import { desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { type NewOdometerReading, type OdometerReading, odometerReadings, vehicles } from '@/db/schema';
import { generateId } from '@/lib/id';

export async function listOdometerReadings(vehicleId: string): Promise<OdometerReading[]> {
  return db
    .select()
    .from(odometerReadings)
    .where(eq(odometerReadings.vehicleId, vehicleId))
    .orderBy(desc(odometerReadings.date));
}

export type CreateOdometerReadingInput = Omit<NewOdometerReading, 'id'>;

/**
 * Records a new reading and, if it's higher than the vehicle's current odometer,
 * also bumps `vehicles.currentOdometerKm` — the single value the interval engine
 * and dashboard read from.
 */
export async function createOdometerReading(input: CreateOdometerReadingInput): Promise<OdometerReading> {
  const [created] = await db
    .insert(odometerReadings)
    .values({ ...input, id: generateId() })
    .returning();

  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, input.vehicleId));
  if (vehicle && input.valueKm > vehicle.currentOdometerKm) {
    await db
      .update(vehicles)
      .set({ currentOdometerKm: input.valueKm })
      .where(eq(vehicles.id, input.vehicleId));
  }

  return created;
}

export async function deleteOdometerReading(id: string): Promise<void> {
  await db.delete(odometerReadings).where(eq(odometerReadings.id, id));
}
