import { Text, View } from 'react-native';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { useColors } from '@/lib/theme/colors';
import { formatDate, formatTime, formatDuration } from '@/lib/utils/format';

interface RecurringBookingCardProps {
  barberName: string;
  barberProfileImage: string | null;
  serviceName: string;
  nextAppointmentDate: string | null;
  appointmentTime: string | null;
  durationMinutes: number;
  recurringStatus: 'active' | 'paused' | 'pending_approval';
  appointmentsLeft: number;
  onPress?: () => void;
}

export default function RecurringBookingCard({
  barberName,
  barberProfileImage,
  serviceName,
  nextAppointmentDate,
  appointmentTime,
  durationMinutes,
  recurringStatus,
  appointmentsLeft,
  onPress,
}: RecurringBookingCardProps) {
  const colors = useColors();

  return (
    <Card onPress={onPress} elevated className="mb-[10px]">
      <View className="flex-row items-center gap-3">
        <Avatar name={barberName} size={42} uri={barberProfileImage ?? undefined} />
        <View className="flex-1 min-w-0">
          <Text className="text-[15px] font-semibold text-ink tracking-[-0.2px]" numberOfLines={1}>
            {barberName}
          </Text>
          <Text className="text-[13px] text-secondary mt-[2px]" numberOfLines={1}>
            {serviceName} · {formatDuration(durationMinutes)}
          </Text>

          {nextAppointmentDate && appointmentTime ? (
            <View className="flex-row items-center gap-[4px] mt-[4px]">
              <Icon name="calendar" size={12} color={colors.tertiary} />
              <Text className="text-[12px] text-tertiary">
                Next: {formatDate(nextAppointmentDate)} · {formatTime(appointmentTime)}
              </Text>
            </View>
          ) : (
            <Text className="text-[12px] text-tertiary mt-[4px]">
              {recurringStatus === 'pending_approval' ? 'Awaiting barber approval' : 'No upcoming appointments'}
            </Text>
          )}

          <View className="flex-row items-center gap-2 mt-[6px]">
            <StatusBadge status={recurringStatus} />
            {appointmentsLeft > 0 && (
              <Text className="text-[11px] text-tertiary">
                {appointmentsLeft} left
              </Text>
            )}
          </View>
        </View>
        <Icon name="chevron" size={16} color={colors.quaternary} />
      </View>
    </Card>
  );
}
