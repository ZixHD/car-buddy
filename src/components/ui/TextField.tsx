import { Text, TextInput, type TextInputProps, View } from 'react-native';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, className, ...inputProps }: TextFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Text>
      <TextInput
        className={`rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white ${className ?? ''}`}
        placeholderTextColor="#9ca3af"
        {...inputProps}
      />
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
