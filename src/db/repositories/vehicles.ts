import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { type NewVehicle, type Vehicle, vehicles } from '@/db/schema';
import { generateId } from '@/lib/id';

export async function listVehicles(): Promise<Vehicle[]> {
  return db.select().from(vehicles).orderBy(vehicles.createdAt);
}

export async function getVehicle(id: string): Promise<Vehicle | undefined> {
  const rows = await db.select().from(vehicles).where(eq(vehicles.id, id));
  return rows[0];
}

export type CreateVehicleInput = Omit<NewVehicle, 'id' | 'createdAt'>;

export async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  const [created] = await db
    .insert(vehicles)
    .values({ ...input, id: generateId(), createdAt: new Date().toISOString() })
    .returning();
  return created;
}

export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export async function updateVehicle(id: string, patch: UpdateVehicleInput): Promise<Vehicle> {
  const [updated] = await db.update(vehicles).set(patch).where(eq(vehicles.id, id)).returning();
  return updated;
}

export async function deleteVehicle(id: string): Promise<void> {
  await db.delete(vehicles).where(eq(vehicles.id, id));
}
