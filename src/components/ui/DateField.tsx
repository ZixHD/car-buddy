import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { TextField } from './TextField';

interface DateFieldProps {
  label: string;
  /** ISO date string, yyyy-MM-dd. */
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
}

function toDate(value: string | null): Date {
  return value ? new Date(`${value}T00:00:00`) : new Date();
}

function formatIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const [showIosPicker, setShowIosPicker] = useState(false);

  // react-native-community/datetimepicker has no web implementation; fall back to
  // plain text entry there so `npm run web` doesn't crash while trying the app out.
  if (Platform.OS === 'web') {
    return (
      <TextField
        label={label}
        value={value ?? ''}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        error={error}
      />
    );
  }

  function openPicker() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: toDate(value),
        mode: 'date',
        onValueChange: (_event, selected) => {
          onChange(formatIso(selected));
        },
      });
    } else {
      setShowIosPicker(true);
    }
  }

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Text>
      <Pressable
        onPress={openPicker}
        className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
        <Text className={value ? 'text-base text-gray-900 dark:text-white' : 'text-base text-gray-400'}>
          {value ?? 'YYYY-MM-DD'}
        </Text>
      </Pressable>
      {showIosPicker && (
        <DateTimePicker
          value={toDate(value)}
          mode="date"
          display="inline"
          onValueChange={(_event, selected) => {
            setShowIosPicker(false);
            onChange(formatIso(selected));
          }}
          onDismiss={() => setShowIosPicker(false)}
        />
      )}
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
