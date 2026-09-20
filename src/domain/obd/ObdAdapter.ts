export interface LiveDataSnapshot {
  timestamp: string; // ISO
  rpm: number | null;
  speedKmh: number | null;
  coolantTempC: number | null;
  batteryVoltage: number | null;
  fuelLevelPercent: number | null;
  intakeAirTempC: number | null;
}

export interface DtcReadResult {
  code: string;
  timestamp: string; // ISO
}

export type ObdConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * The seam between the app and real OBD-II hardware. Every screen and hook talks
 * to this interface only — never to BLE or ELM327 specifics directly — so Phase 2
 * can swap MockObdAdapter for a real ElmObdAdapter without touching UI code.
 */
export interface ObdAdapter {
  getState(): ObdConnectionState;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  readMileage(): Promise<number | null>;
  readLiveData(): Promise<LiveDataSnapshot>;
  readDtcCodes(): Promise<DtcReadResult[]>;
  clearDtcCodes(): Promise<void>;
}
