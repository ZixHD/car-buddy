import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { listDtcReadings, markAllDtcReadingsCleared, recordDtcReadings } from '@/db/repositories/dtcReadings';
import { type DtcInfo } from '@/domain/dtc/types';
import { dtcLookupService } from '@/domain/dtc/SeedDtcLookupService';
import { MockObdAdapter } from '@/domain/obd/MockObdAdapter';
import { type ObdAdapter, type ObdConnectionState } from '@/domain/obd/ObdAdapter';

/**
 * Single app-wide adapter instance, matching how a real BLE dongle would work
 * (one device connection at a time). Swap this line for a real ElmObdAdapter in
 * Phase 2 — nothing else in this file, or any screen, needs to change.
 */
const obdAdapter: ObdAdapter = new MockObdAdapter();

export const dtcReadingsQueryKey = (vehicleId: string) => ['dtcReadings', vehicleId] as const;
const liveDataQueryKey = ['obdLiveData'] as const;
const dtcCodesQueryKey = (locale: string) => ['obdDtcCodes', locale] as const;

function useSupportedLocale(): 'en' | 'sr' {
  const { i18n } = useTranslation();
  return i18n.language?.startsWith('sr') ? 'sr' : 'en';
}

export function useObdConnection() {
  const [state, setState] = useState<ObdConnectionState>(obdAdapter.getState());
  const queryClient = useQueryClient();

  const connect = useMutation({
    mutationFn: async () => {
      setState('connecting');
      await obdAdapter.connect();
    },
    onSuccess: () => setState(obdAdapter.getState()),
    onError: () => setState(obdAdapter.getState()),
  });

  const disconnect = useMutation({
    mutationFn: async () => {
      await obdAdapter.disconnect();
    },
    onSuccess: () => {
      setState(obdAdapter.getState());
      queryClient.removeQueries({ queryKey: liveDataQueryKey });
    },
  });

  return { state, connect, disconnect };
}

export function useLiveData(enabled: boolean) {
  return useQuery({
    queryKey: liveDataQueryKey,
    queryFn: () => obdAdapter.readLiveData(),
    enabled,
    refetchInterval: enabled ? 2000 : false,
  });
}

export interface DtcCodeWithInfo {
  code: string;
  timestamp: string;
  info: DtcInfo | null;
}

export function useReadDtcCodes(vehicleId: string | undefined) {
  const locale = useSupportedLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<DtcCodeWithInfo[]> => {
      const codes = await obdAdapter.readDtcCodes();
      if (vehicleId) {
        await recordDtcReadings(vehicleId, codes);
      }
      return codes.map((c) => ({ ...c, info: dtcLookupService.lookup(c.code, locale) }));
    },
    onSuccess: (data) => {
      queryClient.setQueryData(dtcCodesQueryKey(locale), data);
      if (vehicleId) {
        queryClient.invalidateQueries({ queryKey: dtcReadingsQueryKey(vehicleId) });
      }
    },
  });
}

export function useLastReadDtcCodes(): DtcCodeWithInfo[] | undefined {
  const locale = useSupportedLocale();
  const queryClient = useQueryClient();
  return queryClient.getQueryData<DtcCodeWithInfo[]>(dtcCodesQueryKey(locale));
}

export function useClearDtcCodes(vehicleId: string | undefined) {
  const locale = useSupportedLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await obdAdapter.clearDtcCodes();
      if (vehicleId) await markAllDtcReadingsCleared(vehicleId);
    },
    onSuccess: () => {
      queryClient.setQueryData(dtcCodesQueryKey(locale), []);
      if (vehicleId) {
        queryClient.invalidateQueries({ queryKey: dtcReadingsQueryKey(vehicleId) });
      }
    },
  });
}

export function useDtcHistory(vehicleId: string | undefined) {
  return useQuery({
    queryKey: dtcReadingsQueryKey(vehicleId ?? ''),
    queryFn: () => listDtcReadings(vehicleId!),
    enabled: !!vehicleId,
  });
}
