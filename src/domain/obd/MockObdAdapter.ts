import type { DtcReadResult, LiveDataSnapshot, ObdAdapter, ObdConnectionState } from './ObdAdapter';

const SAMPLE_FAULT_CODES = ['P0420', 'P0171', 'P0300'];

/**
 * Fake OBD-II adapter used for the whole app (including the diagnostics UI) until
 * real hardware is wired up in Phase 2. Simulates connection latency and returns
 * plausible-looking live data and a small set of demo fault codes so the plain-language
 * explanation experience can be built and demoed without a dongle.
 */
export class MockObdAdapter implements ObdAdapter {
  private state: ObdConnectionState = 'disconnected';
  private mileageKm = 87_540;
  private activeCodes: string[] = [...SAMPLE_FAULT_CODES];

  getState(): ObdConnectionState {
    return this.state;
  }

  async connect(): Promise<void> {
    this.state = 'connecting';
    await delay(1200);
    this.state = 'connected';
  }

  async disconnect(): Promise<void> {
    await delay(200);
    this.state = 'disconnected';
  }

  async readMileage(): Promise<number | null> {
    this.assertConnected();
    await delay(300);
    this.mileageKm += Math.floor(Math.random() * 3);
    return this.mileageKm;
  }

  async readLiveData(): Promise<LiveDataSnapshot> {
    this.assertConnected();
    await delay(400);
    return {
      timestamp: new Date().toISOString(),
      rpm: 750 + Math.round(Math.random() * 150),
      speedKmh: 0,
      coolantTempC: 88 + Math.round(Math.random() * 4),
      batteryVoltage: Number((13.8 + Math.random() * 0.6).toFixed(1)),
      fuelLevelPercent: 62,
      intakeAirTempC: 24 + Math.round(Math.random() * 3),
    };
  }

  async readDtcCodes(): Promise<DtcReadResult[]> {
    this.assertConnected();
    await delay(600);
    const now = new Date().toISOString();
    return this.activeCodes.map((code) => ({ code, timestamp: now }));
  }

  async clearDtcCodes(): Promise<void> {
    this.assertConnected();
    await delay(500);
    this.activeCodes = [];
  }

  private assertConnected() {
    if (this.state !== 'connected') {
      throw new Error('Not connected to a device.');
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
