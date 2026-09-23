import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useBleScanner } from '@/hooks/useBleScanner';

export default function BleScanScreen() {
  const { t } = useTranslation();
  const { state, devices, startScan, stopScan } = useBleScanner();
  const isScanning = state === 'scanning';

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: t('bleScan.title') }} />

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <Text className="text-sm text-blue-800 dark:text-blue-300">{t('bleScan.intro')}</Text>
      </Card>

      <Button
        label={isScanning ? t('bleScan.stop') : t('bleScan.scan')}
        variant={isScanning ? 'secondary' : 'primary'}
        onPress={isScanning ? stopScan : startScan}
      />

      {state === 'permission-denied' && (
        <Card>
          <Text className="text-red-600">{t('bleScan.permissionDenied')}</Text>
        </Card>
      )}
      {state === 'bluetooth-off' && (
        <Card>
          <Text className="text-red-600">{t('bleScan.bluetoothOff')}</Text>
        </Card>
      )}

      {isScanning && (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator />
          <Text className="text-sm text-gray-500 dark:text-gray-400">{t('bleScan.scanning')}</Text>
        </View>
      )}

      {!isScanning && devices.length === 0 && state === 'idle' ? null : devices.length === 0 ? (
        <EmptyState icon="bluetooth-outline" title={t('bleScan.noDevices')} body="" />
      ) : (
        <View className="gap-2">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('bleScan.deviceCount', { count: devices.length })}
          </Text>
          {devices.map((device) => (
            <Card key={device.id} className="gap-1">
              <Text className="font-semibold text-gray-900 dark:text-white">{device.name}</Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500">{device.id}</Text>
              {device.rssi != null ? (
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {t('bleScan.signal', { value: device.rssi })}
                </Text>
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}
