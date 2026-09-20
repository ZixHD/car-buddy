import { ActivityIndicator, Pressable, Text } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
}

const CONTAINER_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 active:bg-blue-700',
  secondary: 'bg-gray-200 active:bg-gray-300 dark:bg-neutral-800 dark:active:bg-neutral-700',
  destructive: 'bg-red-600 active:bg-red-700',
};

const TEXT_STYLES: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-gray-900 dark:text-white',
  destructive: 'text-white',
};

export function Button({ label, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`items-center justify-center rounded-xl px-4 py-3 ${CONTAINER_STYLES[variant]} ${isDisabled ? 'opacity-50' : ''}`}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#111827' : '#ffffff'} />
      ) : (
        <Text className={`text-base font-semibold ${TEXT_STYLES[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
