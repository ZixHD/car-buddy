import { Picker } from '@react-native-picker/picker';
import { Text, View } from 'react-native';

interface SelectOption<T extends string> {
  label: string;
  value: T;
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
}

export function SelectField<T extends string>({ label, value, onChange, options }: SelectFieldProps<T>) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Text>
      <View className="overflow-hidden rounded-xl border border-gray-300 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <Picker selectedValue={value} onValueChange={(next) => onChange(next as T)}>
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
}
