import { db } from '@/db/client';
import { vehicles } from '@/db/schema';

/** Deletes every vehicle; ON DELETE CASCADE takes care of all dependent tables. */
export async function resetAllData(): Promise<void> {
  await db.delete(vehicles);
}
