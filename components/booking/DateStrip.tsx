import { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useColors } from '@/lib/theme/colors';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface DateStripProps {
  startDate: Date;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  workingDays?: number[];
}

export default function DateStrip({
  startDate,
  selectedDate,
  onSelect,
  workingDays,
}: DateStripProps) {
  const colors = useColors();
  const todayStr = toDateString(new Date());

  const days: { date: Date; dateStr: string; dayOfWeek: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push({ date: d, dateStr: toDateString(d), dayOfWeek: d.getDay() });
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerClassName="gap-[8px] px-[2px] py-1"
    >
      {days.map(({ dateStr, dayOfWeek, date }) => {
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === todayStr;
        const isWorking = !workingDays || workingDays.includes(dayOfWeek);

        return (
          <Pressable
            key={dateStr}
            onPress={() => onSelect(dateStr)}
            style={{
              backgroundColor: isSelected ? colors.brand : colors.card,
              borderWidth: isSelected ? 0 : 1,
              borderColor: colors.separatorOpaque,
            }}
            className="w-[52px] py-[10px] rounded-md items-center active:opacity-70"
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${DAY_NAMES[dayOfWeek]} ${date.getDate()}${isToday ? ', today' : ''}`}
          >
            <Text
              style={{ color: isSelected ? colors.white : isWorking ? colors.secondary : colors.quaternary }}
              className="text-[11px] font-semibold tracking-[0.3px] uppercase"
            >
              {DAY_NAMES[dayOfWeek]}
            </Text>
            <Text
              style={{ color: isSelected ? colors.white : isWorking ? colors.ink : colors.quaternary }}
              className="text-[18px] font-bold mt-[2px]"
            >
              {date.getDate()}
            </Text>
            {isToday && !isSelected && (
              <View
                style={{ backgroundColor: colors.brand }}
                className="w-[5px] h-[5px] rounded-full mt-[3px]"
              />
            )}
            {isToday && isSelected && (
              <View className="w-[5px] h-[5px] rounded-full mt-[3px] bg-white" />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
