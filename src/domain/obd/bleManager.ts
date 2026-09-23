import { BleManager } from 'react-native-ble-plx';

/**
 * Single app-wide BLE manager instance. react-native-ble-plx recommends creating
 * exactly one of these; it owns the native Bluetooth Central Manager resource.
 */
export const bleManager = new BleManager();
