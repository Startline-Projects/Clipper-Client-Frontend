import { Pressable, Text, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import { useThemePreference, useSetThemePreference } from '@/lib/stores/theme';
import { useColors } from '@/lib/theme/colors';

const options: Array<{ value: 'system' | 'light' | 'dark'; label: string; icon: IconName }> = [
  { value: 'system', label: 'System', icon: 'phone' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
];

export default function ThemeToggle() {
  const preference = useThemePreference();
  const setPreference = useSetThemePreference();
  const colors = useColors();

  return (
    <View style={{ flexDirection: 'row', borderRadius: 12, backgroundColor: colors.bgWarm, padding: 3 }}>
      {options.map((opt) => {
        const active = preference === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => setPreference(opt.value)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: active ? colors.surface : undefined,
              ...(active
                ? {
                    shadowColor: '#000',
                    shadowOpacity: 0.06,
                    shadowOffset: { width: 0, height: 1 },
                    shadowRadius: 3,
                    elevation: 1,
                  }
                : {}),
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${opt.label} theme`}
          >
            <Icon name={opt.icon} size={14} color={active ? colors.brand : colors.tertiary} />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                letterSpacing: -0.1,
                color: active ? colors.ink : colors.tertiary,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
