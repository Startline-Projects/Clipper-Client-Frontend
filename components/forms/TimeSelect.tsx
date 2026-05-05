import { Pressable, Text, View, ScrollView } from 'react-native';
import { useColors } from '@/lib/theme/colors';

interface TimeSelectProps {
  value: string | null;
  onSelect: (time24: string) => void;
  times: string[];
  accentColor?: string;
}

function to12Hr(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, '0')} ${suffix}`;
}

export default function TimeSelect({
  value,
  onSelect,
  times,
  accentColor,
}: TimeSelectProps) {
  const colors = useColors();
  const accent = accentColor ?? colors.brand;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ gap: 8 }}
    >
      {times.map((t) => {
        const selected = t === value;
        return (
          <Pressable
            key={t}
            onPress={() => onSelect(t)}
            className="px-4 py-[10px] rounded-sm items-center justify-center active:opacity-70"
            style={{
              backgroundColor: selected ? accent : colors.surface,
              borderWidth: 1.5,
              borderColor: selected ? accent : colors.separatorOpaque,
            }}
          >
            <Text
              className="text-[14px] font-semibold tracking-[-0.1px]"
              style={{ color: selected ? '#FFFFFF' : colors.ink }}
            >
              {to12Hr(t)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
