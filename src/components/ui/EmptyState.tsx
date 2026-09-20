import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}

export function EmptyState({ icon, title, body }: EmptyStateProps) {
  return (
    <View className="items-center gap-2 px-6 py-12">
      <Ionicons name={icon} size={40} color="#9ca3af" />
      <Text className="text-center text-lg font-semibold text-gray-900 dark:text-white">{title}</Text>
      <Text className="text-center text-sm text-gray-500 dark:text-gray-400">{body}</Text>
    </View>
  );
}
