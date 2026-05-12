import { Pressable, Text, View } from 'react-native';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import Badge from '@/components/ui/Badge';
import { useColors } from '@/lib/theme/colors';
import { formatDate, formatTime, formatDuration } from '@/lib/utils/format';

interface NextBookingCardProps {
  barberName: string;
  barberProfileImage: string | null;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  status: string;
  isRecurring: boolean;
  onPress?: () => void;
}

export default function NextBookingCard({
  barberName,
  barberProfileImage,
  serviceName,
  appointmentDate,
  appointmentTime,
  durationMinutes,
  status,
  isRecurring,
  onPress,
}: NextBookingCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={{ borderLeftWidth: 3, borderLeftColor: colors.brand }}
      className="bg-card rounded-lg p-4 mb-sm shadow-sm shadow-black/6 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`Next booking with ${barberName}, ${serviceName}`}
    >
      <View className="flex-row gap-3">
        <Avatar name={barberName} size={48} uri={barberProfileImage ?? undefined} />
        <View className="flex-1 min-w-0">
          <Text className="text-[16px] font-semibold text-ink tracking-[-0.2px]" numberOfLines={1}>
            {barberName}
          </Text>
          <Text className="text-[14px] text-secondary mt-[2px]" numberOfLines={1}>
            {serviceName}
          </Text>

          <View className="flex-row items-center gap-3 mt-[8px]">
            <View className="flex-row items-center gap-[4px]">
              <Icon name="calendar" size={13} color={colors.tertiary} />
              <Text className="text-[13px] text-secondary">{formatDate(appointmentDate)}</Text>
            </View>
            <View className="flex-row items-center gap-[4px]">
              <Icon name="clock" size={13} color={colors.tertiary} />
              <Text className="text-[13px] text-secondary">
                {formatTime(appointmentTime)} · {formatDuration(durationMinutes)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2 mt-[8px]">
            <StatusBadge status={status} />
            {isRecurring && <Badge label="Recurring" color={colors.badgeRecurring} bg={colors.badgeRecurringBg} />}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
