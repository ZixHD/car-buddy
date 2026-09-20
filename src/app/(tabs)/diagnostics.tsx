import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import {
  type DtcCodeWithInfo,
  useClearDtcCodes,
  useLiveData,
  useObdConnection,
  useReadDtcCodes,
} from '@/hooks/useDiagnostics';
import { useVehicles } from '@/hooks/useVehicles';
import { useActiveVehicleStore } from '@/stores/useActiveVehicleStore';

export default function DiagnosticsScreen() {
  const { t } = useTranslation();
  const { data: vehicles } = useVehicles();
  const { activeVehicleId, setActiveVehicleId } = useActiveVehicleStore();

  useEffect(() => {
    if (!activeVehicleId && vehicles && vehicles.length > 0) setActiveVehicleId(vehicles[0].id);
  }, [activeVehicleId, vehicles, setActiveVehicleId]);

  const selectedVehicleId = activeVehicleId ?? vehicles?.[0]?.id;

  const { state, connect, disconnect } = useObdConnection();
  const isConnected = state === 'connected';
  const { data: liveData } = useLiveData(isConnected);
  const readCodes = useReadDtcCodes(selectedVehicleId);
  const clearCodes = useClearDtcCodes(selectedVehicleId);

  function confirmClear() {
    Alert.alert(t('diagnostics.clearCodesConfirmTitle'), t('diagnostics.clearCodesConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('diagnostics.clearCodes'), style: 'destructive', onPress: () => clearCodes.mutate() },
    ]);
  }

  return (
    <ScreenContainer>
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">{t('diagnostics.title')}</Text>

      <Card className="gap-2 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <Text className="text-sm text-blue-800 dark:text-blue-300">{t('diagnostics.mockNotice')}</Text>
      </Card>

      {vehicles && vehicles.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
          <View className="flex-row gap-2">
            {vehicles.map((vehicle) => {
              const selected = vehicle.id === selectedVehicleId;
              return (
                <Pressable
                  key={vehicle.id}
                  onPress={() => setActiveVehicleId(vehicle.id)}
                  className={`rounded-full px-4 py-2 ${selected ? 'bg-blue-600' : 'bg-gray-200 dark:bg-neutral-800'}`}>
                  <Text className={selected ? 'font-semibold text-white' : 'text-gray-700 dark:text-gray-300'}>
                    {vehicle.nickname}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      <Card className="gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <Text className="font-semibold text-gray-900 dark:text-white">
              {state === 'connecting'
                ? t('diagnostics.connecting')
                : isConnected
                  ? t('diagnostics.connected')
                  : t('diagnostics.notConnected')}
            </Text>
          </View>
          <Button
            label={isConnected ? t('diagnostics.disconnect') : t('diagnostics.connect')}
            variant={isConnected ? 'secondary' : 'primary'}
            loading={connect.isPending}
            onPress={() => (isConnected ? disconnect.mutate() : connect.mutate())}
          />
        </View>
      </Card>

      {isConnected && (
        <Card className="gap-3">
          <Text className="font-semibold text-gray-900 dark:text-white">{t('diagnostics.liveDataSection')}</Text>
          {!liveData ? (
            <ActivityIndicator />
          ) : (
            <View className="flex-row flex-wrap gap-4">
              <LiveStat label={t('diagnostics.rpm')} value={liveData.rpm != null ? `${liveData.rpm}` : '—'} />
              <LiveStat
                label={t('diagnostics.speed')}
                value={liveData.speedKmh != null ? `${liveData.speedKmh} km/h` : '—'}
              />
              <LiveStat
                label={t('diagnostics.coolantTemp')}
                value={liveData.coolantTempC != null ? `${liveData.coolantTempC}°C` : '—'}
              />
              <LiveStat
                label={t('diagnostics.batteryVoltage')}
                value={liveData.batteryVoltage != null ? `${liveData.batteryVoltage}V` : '—'}
              />
              <LiveStat
                label={t('diagnostics.fuelLevel')}
                value={liveData.fuelLevelPercent != null ? `${liveData.fuelLevelPercent}%` : '—'}
              />
              <LiveStat
                label={t('diagnostics.intakeTemp')}
                value={liveData.intakeAirTempC != null ? `${liveData.intakeAirTempC}°C` : '—'}
              />
            </View>
          )}
        </Card>
      )}

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">{t('diagnostics.faultCodesSection')}</Text>
          <Button
            label={t('diagnostics.readCodes')}
            loading={readCodes.isPending}
            disabled={!isConnected}
            onPress={() => readCodes.mutate()}
          />
        </View>

        {!isConnected && !readCodes.data ? (
          <Text className="text-sm text-gray-500 dark:text-gray-400">{t('diagnostics.connectFirst')}</Text>
        ) : readCodes.isPending ? (
          <ActivityIndicator className="mt-4" />
        ) : !readCodes.data ? (
          <Text className="text-sm text-gray-500 dark:text-gray-400">{t('diagnostics.noCodes')}</Text>
        ) : readCodes.data.length === 0 ? (
          <Card>
            <Text className="text-green-700 dark:text-green-400">{t('diagnostics.allClear')}</Text>
          </Card>
        ) : (
          <>
            {readCodes.data.map((item) => (
              <DtcCard key={item.code} item={item} />
            ))}
            <Button
              label={t('diagnostics.clearCodes')}
              variant="destructive"
              loading={clearCodes.isPending}
              onPress={confirmClear}
            />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

function LiveStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[28%] gap-0.5">
      <Text className="text-xs text-gray-500 dark:text-gray-400">{label}</Text>
      <Text className="text-base font-semibold text-gray-900 dark:text-white">{value}</Text>
    </View>
  );
}

function DtcCard({ item }: { item: DtcCodeWithInfo }) {
  const { t } = useTranslation();

  if (!item.info) {
    return (
      <Card className="gap-1">
        <Text className="font-semibold text-gray-900 dark:text-white">{item.code}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {t('diagnostics.unknownCode', { code: item.code })}
        </Text>
      </Card>
    );
  }

  const tone = item.info.severity === 'stop' ? 'stop' : item.info.severity === 'soon' ? 'soon' : 'safe';

  return (
    <Card className="gap-2">
      <Text className="font-semibold text-gray-900 dark:text-white">
        {item.code} · {item.info.name}
      </Text>
      <SeverityBadge tone={tone} label={t(`diagnostics.severity_${item.info.severity}`)} />
      <Text className="text-sm text-gray-700 dark:text-gray-300">{item.info.meaning}</Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        {t('diagnostics.whatIfIgnored', { text: item.info.ignoreConsequence })}
      </Text>
      <Text className="text-xs text-gray-400 dark:text-gray-500">
        {t('diagnostics.costEstimate', { min: item.info.costMinEur, max: item.info.costMaxEur })} ·{' '}
        {t('diagnostics.costDisclaimer')}
      </Text>
    </Card>
  );
}
