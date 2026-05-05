import { Pressable, Switch, Text, View } from 'react-native';

interface ToggleProps {
  on: boolean;
  onToggle: () => void;
  label: string;
  sub?: string;
}

export default function Toggle({ on, onToggle, label, sub }: ToggleProps) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center justify-between py-[11px] gap-3"
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
        trackColor={{ false: '#E5E5EA', true: '#30D158' }}
        thumbColor="#FFFFFF"
      />
    </Pressable>
  );
}
