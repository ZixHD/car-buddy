import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

import * as schema from './schema';

const CREATE_TABLES_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY NOT NULL,
  nickname TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  engine_displacement_l REAL,
  engine_power_hp INTEGER,
  transmission TEXT,
  vin TEXT,
  plate TEXT,
  current_odometer_km INTEGER NOT NULL DEFAULT 0,
  purchase_date TEXT,
  registration_expiry TEXT,
  insurance_expiry TEXT,
  photo_uri TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS odometer_readings (
  id TEXT PRIMARY KEY NOT NULL,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  value_km INTEGER NOT NULL,
  date TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual'
);

CREATE TABLE IF NOT EXISTS service_intervals (
  id TEXT PRIMARY KEY NOT NULL,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  interval_km INTEGER,
  interval_months INTEGER,
  last_service_odometer_km INTEGER,
  last_service_date TEXT,
  enabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS service_records (
  id TEXT PRIMARY KEY NOT NULL,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  odometer_km INTEGER NOT NULL,
  cost REAL,
  currency TEXT NOT NULL DEFAULT 'RSD',
  location TEXT,
  notes TEXT,
  receipt_uri TEXT
);

CREATE TABLE IF NOT EXISTS dtc_readings (
  id TEXT PRIMARY KEY NOT NULL,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  cleared INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_odometer_readings_vehicle ON odometer_readings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_intervals_vehicle ON service_intervals(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_records_vehicle ON service_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_dtc_readings_vehicle ON dtc_readings(vehicle_id);
`;

/**
 * Phase 1 uses hand-written CREATE TABLE IF NOT EXISTS statements instead of
 * drizzle-kit generated migrations — there's no existing user data to migrate yet.
 * Once the schema needs to evolve on devices that already have data, switch this
 * to drizzle-kit + drizzle-orm/expo-sqlite/migrator.
 */
const sqlite = SQLite.openDatabaseSync('car-buddy.db');
sqlite.execSync(CREATE_TABLES_SQL);

export const db = drizzle(sqlite, { schema });
