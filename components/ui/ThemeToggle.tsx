import { Pressable, Text, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/lib/hooks/useTheme';
import { useSetThemePreference } from '@/lib/stores/theme';
import { useColors } from '@/lib/theme/colors';

export default function ThemeToggle() {
  const theme = useTheme();
  const setPreference = useSetThemePreference();
  const colors = useColors();
  const isDark = theme === 'dark';

  const toggle = () => setPreference(isDark ? 'light' : 'dark');

  return (
    <Pressable
      onPress={toggle}
      className="flex-row items-center justify-between py-4 px-0 active:opacity-70"
      accessibilityRole="switch"
      accessibilityState={{ checked: !isDark }}
      accessibilityLabel="Light mode"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-9 h-9 rounded-full bg-bg-warm items-center justify-center">
          <Icon name={isDark ? 'moon' : 'sun'} size={18} color={colors.brand} />
        </View>
        <Text className="text-base font-medium text-ink">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>
      </View>

      <View
        className={`w-12 h-6 rounded-full justify-center px-1 ${
          isDark ? 'bg-blue' : 'bg-quaternary'
        }`}
      >
        <View
          className={`w-4 h-4 rounded-full bg-surface shadow-sm ${
            isDark ? 'self-end' : 'self-start'
          }`}
        />
      </View>
    </Pressable>
  );
}
