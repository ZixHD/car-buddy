import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export type BadgeTone = 'safe' | 'soon' | 'stop' | 'neutral';

// Mirrors the safe/soon/stop colors in tailwind.config.js. Duplicated here because
// vector icon fill colors can't read Tailwind theme tokens directly.
const TONE_CONFIG: Record<BadgeTone, { bg: string; text: string; hex: string; icon: keyof typeof Ionicons.glyphMap }> = {
  safe: { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-700 dark:text-green-400', hex: '#16a34a', icon: 'checkmark-circle' },
  soon: { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-400', hex: '#d97706', icon: 'alert-circle' },
  stop: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-700 dark:text-red-400', hex: '#dc2626', icon: 'warning' },
  neutral: { bg: 'bg-gray-100 dark:bg-neutral-800', text: 'text-gray-600 dark:text-gray-300', hex: '#6b7280', icon: 'help-circle' },
};

/**
 * Status/severity indicator used for both DTC severity and reminder due-status.
 * Always pairs an icon with the color and label — never relies on color alone,
 * per the accessibility requirement in PLAN.md.
 */
export function SeverityBadge({ tone, label }: { tone: BadgeTone; label: string }) {
  const config = TONE_CONFIG[tone];
  return (
    <View className={`flex-row items-center gap-1.5 self-start rounded-full px-3 py-1 ${config.bg}`}>
      <Ionicons name={config.icon} size={14} color={config.hex} />
      <Text className={`text-xs font-semibold ${config.text}`}>{label}</Text>
    </View>
  );
}
