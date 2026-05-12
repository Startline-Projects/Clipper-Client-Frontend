import { Pressable, Text, View } from 'react-native';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import { useColors } from '@/lib/theme/colors';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils/format';

interface PastBookingCardProps {
  barberName: string;
  barberProfileImage: string | null;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  pricePaid: number;
  hasReview: boolean;
  onPress?: () => void;
  onReview?: () => void;
}

export default function PastBookingCard({
  barberName,
  barberProfileImage,
  serviceName,
  appointmentDate,
  appointmentTime,
  pricePaid,
  hasReview,
  onPress,
  onReview,
}: PastBookingCardProps) {
  const colors = useColors();

  return (
    <Card onPress={onPress} elevated className="mb-[10px]" accessibilityLabel={`Past booking with ${barberName}, ${serviceName}`}>
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
              {formatDate(appointmentDate)} · {formatTime(appointmentTime)}
            </Text>
          </View>
        </View>
        <Text className="text-[17px] font-bold text-ink tracking-[-0.3px]">
          {formatCurrency(pricePaid)}
        </Text>
      </View>

      {!hasReview && onReview && (
        <Pressable onPress={onReview} className="mt-3 pt-3 border-t-[0.5px] border-separator active:opacity-70" accessibilityRole="button" accessibilityLabel="Leave a review">
          <View className="flex-row items-center justify-center gap-[6px]">
            <Icon name="star" size={14} color={colors.brand} />
            <Text className="text-[14px] font-semibold text-brand">Leave a review</Text>
          </View>
        </Pressable>
      )}
    </Card>
  );
}
