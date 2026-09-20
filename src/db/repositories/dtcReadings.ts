import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { type DtcReading, dtcReadings } from '@/db/schema';
import { generateId } from '@/lib/id';

export async function listDtcReadings(vehicleId: string): Promise<DtcReading[]> {
  return db
    .select()
    .from(dtcReadings)
    .where(eq(dtcReadings.vehicleId, vehicleId))
    .orderBy(desc(dtcReadings.timestamp));
}

export async function recordDtcReadings(
  vehicleId: string,
  codes: { code: string; timestamp: string }[],
): Promise<void> {
  for (const { code, timestamp } of codes) {
    await db.insert(dtcReadings).values({ id: generateId(), vehicleId, code, timestamp, cleared: false });
  }
}

export async function markAllDtcReadingsCleared(vehicleId: string): Promise<void> {
  await db
    .update(dtcReadings)
    .set({ cleared: true })
    .where(and(eq(dtcReadings.vehicleId, vehicleId), eq(dtcReadings.cleared, false)));
}
