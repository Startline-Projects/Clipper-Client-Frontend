import { Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import { formatTime } from '@/lib/utils/format';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

interface WorkingHour {
  dayOfWeek: number;
  isWorking: boolean;
  startTime: string | null;
  endTime: string | null;
}

interface WorkingHoursTableProps {
  hours: WorkingHour[];
}

export default function WorkingHoursTable({ hours }: WorkingHoursTableProps) {
  const today = new Date().getDay();

  return (
    <Card className="p-[14px] mb-0">
      {hours.map((wh, idx) => {
        const isToday = wh.dayOfWeek === today;

        return (
          <View
            key={wh.dayOfWeek}
            className={`flex-row justify-between py-[7px] ${
              idx < hours.length - 1 ? 'border-b-[0.5px] border-separator' : ''
            }`}
          >
            <Text
              className={`text-[13px] tracking-[-0.1px] ${
                isToday
                  ? 'font-bold text-brand'
                  : wh.isWorking
                    ? 'font-medium text-ink'
                    : 'font-medium text-tertiary'
              }`}
            >
              {DAY_NAMES[wh.dayOfWeek]}
            </Text>
            <Text
              className={`text-[13px] ${
                isToday
                  ? 'font-semibold text-brand'
                  : wh.isWorking
                    ? 'text-secondary'
                    : 'text-tertiary'
              }`}
            >
              {wh.isWorking && wh.startTime && wh.endTime
                ? `${formatTime(wh.startTime)} – ${formatTime(wh.endTime)}`
                : 'Closed'}
            </Text>
          </View>
        );
      })}
    </Card>
  );
}
