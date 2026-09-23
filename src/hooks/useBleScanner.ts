import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { type Device, State as BleAdapterState } from 'react-native-ble-plx';

import { bleManager } from '@/domain/obd/bleManager';

export type BleScanState = 'idle' | 'requesting-permission' | 'permission-denied' | 'bluetooth-off' | 'scanning';

async function requestAndroidPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  // Below Android 12 (API 31), BLE scanning requires location permission (an OS
  // quirk unrelated to actually using location). From 12 onward, with the
  // neverForLocation manifest flag we set in app.json, only the Bluetooth-specific
  // runtime permissions are needed.
  if (Platform.Version < 31) {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  ]);
  return (
    results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
    results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
  );
}

/**
 * Stage 2 of the Phase 2 OBD plan: proves the BLE permission + scanning pipeline
 * works end to end. Does not yet know anything about ELM327 specifically — that's
 * Stage 3, once real hardware is available to build and test the protocol against.
 */
export function useBleScanner() {
  const [state, setState] = useState<BleScanState>('idle');
  const [devices, setDevices] = useState<Device[]>([]);
  const seenIds = useRef(new Set<string>());

  const startScan = useCallback(async () => {
    setState('requesting-permission');
    const granted = await requestAndroidPermissions();
    if (!granted) {
      setState('permission-denied');
      return;
    }

    const adapterState = await bleManager.state();
    if (adapterState !== BleAdapterState.PoweredOn) {
      setState('bluetooth-off');
      return;
    }

    seenIds.current = new Set();
    setDevices([]);
    setState('scanning');

    bleManager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        setState('idle');
        return;
      }
      // Most ELM327 dongles (and most BLE peripherals worth showing in a picker)
      // advertise a name; unnamed devices are filtered out to keep the list usable.
      if (device?.name && !seenIds.current.has(device.id)) {
        seenIds.current.add(device.id);
        setDevices((prev) => [...prev, device]);
      }
    });
  }, []);

  const stopScan = useCallback(() => {
    bleManager.stopDeviceScan();
    setState('idle');
  }, []);

  useEffect(() => stopScan, [stopScan]);

  return { state, devices, startScan, stopScan };
}
