import { Pressable, Switch, Text, View } from 'react-native';
import { useColors } from '@/lib/theme/colors';

interface ToggleProps {
  on: boolean;
  onToggle: () => void;
  label: string;
  sub?: string;
}

export default function Toggle({ on, onToggle, label, sub }: ToggleProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center justify-between py-[11px] gap-3"
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
    >
      <View className="flex-1">
        <Text className="text-[15px] font-medium text-ink tracking-[-0.2px]">
          {label}
        </Text>
        {sub && (
          <Text className="text-[12px] text-tertiary mt-[2px] leading-[16px]">
            {sub}
          </Text>
        )}
      </View>

      <Switch
        value={on}
        onValueChange={onToggle}
        trackColor={{ false: colors.separatorOpaque, true: colors.green }}
        thumbColor={colors.white}
      />
    </Pressable>
  );
}
