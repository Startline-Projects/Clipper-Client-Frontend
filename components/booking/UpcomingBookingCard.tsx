import { Text, View } from 'react-native';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import Badge from '@/components/ui/Badge';
import { useColors } from '@/lib/theme/colors';
import { formatDate, formatTime, formatDuration } from '@/lib/utils/format';

interface UpcomingBookingCardService {
  id: string;
  name: string;
  durationMinutes: number;
}

interface UpcomingBookingCardProps {
  barberName: string;
  barberProfileImage: string | null;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  totalDurationMinutes: number;
  services?: UpcomingBookingCardService[];
  status: string;
  isRecurring: boolean;
  onPress?: () => void;
}

export default function UpcomingBookingCard({
  barberName,
  barberProfileImage,
  serviceName,
  appointmentDate,
  appointmentTime,
  totalDurationMinutes,
  services,
  status,
  isRecurring,
  onPress,
}: UpcomingBookingCardProps) {
  const colors = useColors();

  return (
    <Card onPress={onPress} elevated className="mb-[10px]" accessibilityLabel={`Booking with ${barberName}, ${serviceName}`}>
      <View className="flex-row items-center gap-3">
        <Avatar name={barberName} size={44} uri={barberProfileImage ?? undefined} />
        <View className="flex-1 min-w-0">
          <Text className="text-[15px] font-semibold text-ink tracking-[-0.2px]" numberOfLines={1}>
            {barberName}
          </Text>
          <Text className="text-[13px] text-secondary mt-[2px]" numberOfLines={1}>
            {serviceName}
          </Text>
          <View className="flex-row items-center gap-[4px] mt-[4px]">
            <Icon name="calendar" size={12} color={colors.tertiary} />
            <Text className="text-[12px] text-tertiary">
              {formatDate(appointmentDate)} · {formatTime(appointmentTime)} · {formatDuration(totalDurationMinutes)}
            </Text>
          </View>
          {services && services.length > 1 && (
            <View className="mt-[6px]">
              {services.map((svc) => (
                <Text
                  key={svc.id}
                  className="text-[12px] text-tertiary"
                  numberOfLines={1}
                >
                  • {svc.name} · {formatDuration(svc.durationMinutes)}
                </Text>
              ))}
            </View>
          )}
          <View className="flex-row items-center gap-2 mt-[6px]">
            <StatusBadge status={status} />
            {isRecurring && <Badge label="Recurring" color={colors.badgeRecurring} bg={colors.badgeRecurringBg} small />}
          </View>
        </View>
        <Icon name="chevron" size={16} color={colors.quaternary} />
      </View>
    </Card>
  );
}
