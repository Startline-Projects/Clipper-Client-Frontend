import { Pressable, Text, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useColors } from '@/lib/theme/colors';
import { formatCurrency } from '@/lib/utils/format';

interface Service {
  id: string;
  name: string;
  serviceType: string;
  regularPrice: number;
  durationMinutes: number;
}

interface ServiceSelectorProps {
  services: Service[];
  selected: string[];
  onToggle: (serviceId: string) => void;
  max?: number;
}

export default function ServiceSelector({
  services,
  selected,
  onToggle,
  max = 4,
}: ServiceSelectorProps) {
  const colors = useColors();

  return (
    <View className="gap-[10px]">
      {services.map((s) => {
        const isSelected = selected.includes(s.id);
        const isDisabled = !isSelected && selected.length >= max;

        return (
          <Pressable
            key={s.id}
            onPress={() => !isDisabled && onToggle(s.id)}
            style={{
              borderWidth: isSelected ? 2 : 1,
              borderColor: isSelected ? colors.brand : colors.separatorOpaque,
              backgroundColor: isSelected ? colors.brandPale : colors.card,
              opacity: isDisabled ? 0.4 : 1,
            }}
            className="rounded-lg p-4 active:opacity-70"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1 min-w-0">
                <Text className="text-[15px] font-semibold text-ink tracking-[-0.2px]">
                  {s.name}
                </Text>
                <View className="flex-row items-center gap-[4px] mt-[4px]">
                  <Icon name="clock" size={11} color={colors.tertiary} />
                  <Text className="text-[12px] text-tertiary">{s.durationMinutes} min</Text>
                </View>
              </View>
              <View className="items-end gap-[4px]">
                <Text
                  style={{ color: colors.brand }}
                  className="text-[18px] font-bold tracking-[-0.3px]"
                >
                  {formatCurrency(s.regularPrice)}
                </Text>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: isSelected ? colors.brand : 'transparent',
                    borderWidth: isSelected ? 0 : 1.5,
                    borderColor: colors.separatorOpaque,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && <Icon name="check" size={14} color="#fff" />}
                </View>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
