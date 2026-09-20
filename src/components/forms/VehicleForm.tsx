import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { type CreateVehicleInput } from '@/db/repositories/vehicles';
import { type FuelType, type Transmission } from '@/db/schema';

export interface VehicleFormValues {
  nickname: string;
  make: string;
  model: string;
  year: string;
  fuelType: FuelType;
  transmission: Transmission;
  engineDisplacementL: string;
  enginePowerHp: string;
  vin: string;
  plate: string;
  currentOdometerKm: string;
  purchaseDate: string | null;
  registrationExpiry: string | null;
  insuranceExpiry: string | null;
}

export const EMPTY_VEHICLE_FORM_VALUES: VehicleFormValues = {
  nickname: '',
  make: '',
  model: '',
  year: String(new Date().getFullYear()),
  fuelType: 'petrol',
  transmission: 'manual',
  engineDisplacementL: '',
  enginePowerHp: '',
  vin: '',
  plate: '',
  currentOdometerKm: '0',
  purchaseDate: null,
  registrationExpiry: null,
  insuranceExpiry: null,
};

export function valuesToInput(values: VehicleFormValues): CreateVehicleInput {
  return {
    nickname: values.nickname.trim(),
    make: values.make.trim(),
    model: values.model.trim(),
    year: Number(values.year) || new Date().getFullYear(),
    fuelType: values.fuelType,
    transmission: values.transmission,
    engineDisplacementL: values.engineDisplacementL ? Number(values.engineDisplacementL) : null,
    enginePowerHp: values.enginePowerHp ? Number(values.enginePowerHp) : null,
    vin: values.vin.trim() || null,
    plate: values.plate.trim() || null,
    currentOdometerKm: Number(values.currentOdometerKm) || 0,
    purchaseDate: values.purchaseDate,
    registrationExpiry: values.registrationExpiry,
    insuranceExpiry: values.insuranceExpiry,
    photoUri: null,
  };
}

interface VehicleFormProps {
  initialValues?: VehicleFormValues;
  onSubmit: (values: VehicleFormValues) => void;
  submitting?: boolean;
  submitLabel: string;
}

export function VehicleForm({ initialValues, onSubmit, submitting, submitLabel }: VehicleFormProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<VehicleFormValues>(initialValues ?? EMPTY_VEHICLE_FORM_VALUES);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof VehicleFormValues>(key: K, value: VehicleFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!values.nickname.trim() || !values.make.trim() || !values.model.trim()) {
      setError(t('vehicleForm.requiredField', { field: t('vehicleForm.nickname') }));
      return;
    }
    setError(null);
    onSubmit(values);
  }

  return (
    <View className="gap-4">
      <TextField
        label={t('vehicleForm.nickname')}
        placeholder={t('vehicleForm.nicknamePlaceholder')}
        value={values.nickname}
        onChangeText={(v) => update('nickname', v)}
        error={error ?? undefined}
      />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField label={t('vehicleForm.make')} value={values.make} onChangeText={(v) => update('make', v)} />
        </View>
        <View className="flex-1">
          <TextField label={t('vehicleForm.model')} value={values.model} onChangeText={(v) => update('model', v)} />
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField
            label={t('vehicleForm.year')}
            value={values.year}
            onChangeText={(v) => update('year', v)}
            keyboardType="number-pad"
          />
        </View>
        <View className="flex-1">
          <TextField
            label={t('vehicleForm.currentOdometer')}
            value={values.currentOdometerKm}
            onChangeText={(v) => update('currentOdometerKm', v)}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <SelectField
        label={t('vehicleForm.fuelType')}
        value={values.fuelType}
        onChange={(v) => update('fuelType', v)}
        options={[
          { value: 'petrol', label: t('vehicleForm.fuel.petrol') },
          { value: 'diesel', label: t('vehicleForm.fuel.diesel') },
          { value: 'lpg', label: t('vehicleForm.fuel.lpg') },
          { value: 'hybrid', label: t('vehicleForm.fuel.hybrid') },
          { value: 'electric', label: t('vehicleForm.fuel.electric') },
        ]}
      />
      <SelectField
        label={t('vehicleForm.transmission')}
        value={values.transmission}
        onChange={(v) => update('transmission', v)}
        options={[
          { value: 'manual', label: t('vehicleForm.transmissionType.manual') },
          { value: 'automatic', label: t('vehicleForm.transmissionType.automatic') },
        ]}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField
            label={`${t('vehicleForm.engineDisplacement')} (${t('common.optional')})`}
            value={values.engineDisplacementL}
            onChangeText={(v) => update('engineDisplacementL', v)}
            keyboardType="decimal-pad"
          />
        </View>
        <View className="flex-1">
          <TextField
            label={`${t('vehicleForm.enginePower')} (${t('common.optional')})`}
            value={values.enginePowerHp}
            onChangeText={(v) => update('enginePowerHp', v)}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <TextField
        label={`${t('vehicleForm.vin')} (${t('common.optional')})`}
        value={values.vin}
        onChangeText={(v) => update('vin', v)}
        autoCapitalize="characters"
      />
      <TextField
        label={`${t('vehicleForm.plate')} (${t('common.optional')})`}
        value={values.plate}
        onChangeText={(v) => update('plate', v)}
        autoCapitalize="characters"
      />

      <DateField
        label={`${t('vehicleForm.purchaseDate')} (${t('common.optional')})`}
        value={values.purchaseDate}
        onChange={(v) => update('purchaseDate', v)}
      />
      <DateField
        label={`${t('vehicleForm.registrationExpiry')} (${t('common.optional')})`}
        value={values.registrationExpiry}
        onChange={(v) => update('registrationExpiry', v)}
      />
      <DateField
        label={`${t('vehicleForm.insuranceExpiry')} (${t('common.optional')})`}
        value={values.insuranceExpiry}
        onChange={(v) => update('insuranceExpiry', v)}
      />

      <Button label={submitLabel} onPress={handleSubmit} loading={submitting} />
    </View>
  );
}
