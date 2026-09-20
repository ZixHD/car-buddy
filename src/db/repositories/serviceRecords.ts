import { desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { type NewServiceRecord, type ServiceRecord, serviceRecords } from '@/db/schema';
import { generateId } from '@/lib/id';

export async function listServiceRecords(vehicleId: string): Promise<ServiceRecord[]> {
  return db
    .select()
    .from(serviceRecords)
    .where(eq(serviceRecords.vehicleId, vehicleId))
    .orderBy(desc(serviceRecords.date));
}

export type CreateServiceRecordInput = Omit<NewServiceRecord, 'id'>;

export async function createServiceRecord(input: CreateServiceRecordInput): Promise<ServiceRecord> {
  const [created] = await db
    .insert(serviceRecords)
    .values({ ...input, id: generateId() })
    .returning();
  return created;
}

export async function deleteServiceRecord(id: string): Promise<void> {
  await db.delete(serviceRecords).where(eq(serviceRecords.id, id));
}
