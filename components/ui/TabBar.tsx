import { Pressable, Text, View } from 'react-native';
import { useColors } from '@/lib/theme/colors';

interface TabBarProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export default function TabBar({ tabs, active, onChange }: TabBarProps) {
  const colors = useColors();

  return (
    <View className="flex-row gap-1 bg-bg rounded-sm p-[3px] mb-lg">
      {tabs.map((tab) => {
        const isActive = active === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: isActive ? colors.surface : undefined,
              ...(isActive
                ? {
                    shadowColor: '#000',
                    shadowOpacity: 0.06,
                    shadowOffset: { width: 0, height: 1 },
                    shadowRadius: 3,
                    elevation: 1,
                  }
                : {}),
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                letterSpacing: -0.1,
                color: isActive ? colors.ink : colors.tertiary,
              }}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
