import { Pressable, Text, View } from 'react-native';
import { useColors } from '@/lib/theme/colors';
import { formatTime, formatCurrency } from '@/lib/utils/format';

interface Slot {
  time: string;
  endTime: string;
  available: boolean;
  price: number;
}

interface SlotGridProps {
  slots: Slot[];
  selectedSlot: string | null;
  onSelect: (time: string, tier: 'regular' | 'afterHours' | 'dayOff') => void;
  tier: 'regular' | 'afterHours' | 'dayOff';
}

function useTierColors() {
  const colors = useColors();
  return {
    regular: colors.brand,
    afterHours: colors.slotAfterHours,
    dayOff: colors.slotDayOff,
  };
}

export default function SlotGrid({
  slots,
  selectedSlot,
  onSelect,
  tier,
}: SlotGridProps) {
  const colors = useColors();
  const tierColors = useTierColors();
  const tierColor = tierColors[tier] ?? colors.brand;

  if (slots.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-[8px] justify-center">
      {slots.map((slot) => {
        const isSelected = slot.time === selectedSlot;
        const isAvailable = slot.available;

        return (
          <Pressable
            key={slot.time}
            onPress={() => isAvailable && onSelect(slot.time, tier)}
            disabled={!isAvailable}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
            accessibilityLabel={`${formatTime(slot.time)}, ${formatCurrency(slot.price)}${!isAvailable ? ', unavailable' : ''}`}
            style={{
              backgroundColor: isSelected
                ? tierColor
                : isAvailable
                  ? colors.card
                  : colors.bgMuted,
              borderWidth: isSelected ? 0 : 1,
              borderColor: isAvailable ? colors.separatorOpaque : 'transparent',
              opacity: isAvailable ? 1 : 0.4,
            }}
            className="w-[calc(33%-6px)] min-w-[95px] py-[10px] px-3 rounded-md items-center active:opacity-70"
          >
            <Text
              style={{ color: isSelected ? colors.white : isAvailable ? colors.ink : colors.tertiary }}
              className="text-[14px] font-semibold tracking-[-0.1px]"
            >
              {formatTime(slot.time)}
            </Text>
            <Text
              style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : isAvailable ? colors.secondary : colors.tertiary }}
              className="text-[12px] mt-[2px]"
            >
              {formatCurrency(slot.price)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
