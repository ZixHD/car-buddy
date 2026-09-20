import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export type FuelType = 'petrol' | 'diesel' | 'lpg' | 'hybrid' | 'electric';
export type Transmission = 'manual' | 'automatic';
export type OdometerSource = 'manual' | 'obd';
export type ServiceIntervalType = 'small' | 'big' | 'yearly' | 'custom';
export type Currency = 'RSD' | 'EUR' | 'USD';

export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  nickname: text('nickname').notNull(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  fuelType: text('fuel_type').$type<FuelType>().notNull(),
  engineDisplacementL: real('engine_displacement_l'),
  enginePowerHp: integer('engine_power_hp'),
  transmission: text('transmission').$type<Transmission>(),
  vin: text('vin'),
  plate: text('plate'),
  currentOdometerKm: integer('current_odometer_km').notNull().default(0),
  purchaseDate: text('purchase_date'),
  registrationExpiry: text('registration_expiry'),
  insuranceExpiry: text('insurance_expiry'),
  photoUri: text('photo_uri'),
  createdAt: text('created_at').notNull(),
});

export const odometerReadings = sqliteTable('odometer_readings', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id')
    .notNull()
    .references(() => vehicles.id, { onDelete: 'cascade' }),
  valueKm: integer('value_km').notNull(),
  date: text('date').notNull(),
  source: text('source').$type<OdometerSource>().notNull().default('manual'),
});

export const serviceIntervals = sqliteTable('service_intervals', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id')
    .notNull()
    .references(() => vehicles.id, { onDelete: 'cascade' }),
  type: text('type').$type<ServiceIntervalType>().notNull(),
  label: text('label').notNull(),
  intervalKm: integer('interval_km'),
  intervalMonths: integer('interval_months'),
  lastServiceOdometerKm: integer('last_service_odometer_km'),
  lastServiceDate: text('last_service_date'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
});

export const serviceRecords = sqliteTable('service_records', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id')
    .notNull()
    .references(() => vehicles.id, { onDelete: 'cascade' }),
  type: text('type').$type<ServiceIntervalType>().notNull(),
  description: text('description').notNull(),
  date: text('date').notNull(),
  odometerKm: integer('odometer_km').notNull(),
  cost: real('cost'),
  currency: text('currency').$type<Currency>().notNull().default('RSD'),
  location: text('location'),
  notes: text('notes'),
  receiptUri: text('receipt_uri'),
});

export const dtcReadings = sqliteTable('dtc_readings', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id')
    .notNull()
    .references(() => vehicles.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  timestamp: text('timestamp').notNull(),
  cleared: integer('cleared', { mode: 'boolean' }).notNull().default(false),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type OdometerReading = typeof odometerReadings.$inferSelect;
export type NewOdometerReading = typeof odometerReadings.$inferInsert;
export type ServiceInterval = typeof serviceIntervals.$inferSelect;
export type NewServiceInterval = typeof serviceIntervals.$inferInsert;
export type ServiceRecord = typeof serviceRecords.$inferSelect;
export type NewServiceRecord = typeof serviceRecords.$inferInsert;
export type DtcReading = typeof dtcReadings.$inferSelect;
export type NewDtcReading = typeof dtcReadings.$inferInsert;
