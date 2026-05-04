import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import Badge from '@/components/ui/Badge';
import PriceBreakdown from '@/components/booking/PriceBreakdown';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import { useBookingDetail, useCancelBooking } from '@/lib/hooks/useBookings';
import { useColors } from '@/lib/theme/colors';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDuration,
  formatRelativeTime,
} from '@/lib/utils/format';

export default function BookingDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { data: booking, isLoading } = useBookingDetail(bookingId);
  const cancel = useCancelBooking();
  const [cancelling, setCancelling] = useState(false);

  if (isLoading || !booking) return <LoadingSpinner />;

  const canCancel =
    booking.status === 'pending' || booking.status === 'confirmed';
  const canReview =
    booking.status === 'completed' && !booking.review;

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => {
            setCancelling(true);
            cancel.mutate(booking.id, {
              onSettled: () => setCancelling(false),
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Booking Detail" onBack={() => router.back()} />
      </View>

      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        <Card className="p-5 mb-4">
          <View className="flex-row items-center gap-3 pb-4 mb-4 border-b border-separator">
            <Avatar
              name={booking.barber.name}
              size={48}
              uri={booking.barber.profilePhotoUrl ?? undefined}
            />
            <View className="flex-1">
              <Text className="text-[16px] font-semibold text-ink tracking-[-0.2px]">
                {booking.barber.name}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <StatusBadge status={booking.status} />
                {booking.isRecurring && (
                  <Badge label="Recurring" color="#C47F17" bg="#FDF3E0" small />
                )}
              </View>
            </View>
          </View>

          <View>
            {[
              { label: 'Date', value: formatDate(booking.scheduledAt.slice(0, 10)) },
              { label: 'Time', value: formatTime(booking.scheduledAt.slice(11, 16)) },
              { label: 'Duration', value: formatDuration(booking.totalDurationMinutes) },
              { label: 'Total', value: formatCurrency(booking.totalPrice) },
            ].map((row) => (
              <View
                key={row.label}
                className="flex-row justify-between py-[10px] border-b-[0.5px] border-separator"
              >
                <Text className="text-[14px] text-secondary">{row.label}</Text>
                <Text className="text-[14px] font-semibold text-ink">
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Text className="text-[18px] font-bold text-ink tracking-[-0.3px] mb-3">
          Services
        </Text>
        <PriceBreakdown
          services={booking.services}
          total={booking.pricing}
        />

        {booking.status === 'cancelled' && booking.cancelledAt && (
          <Card
            className="mt-4 p-4"
            style={{ borderLeftWidth: 3, borderLeftColor: colors.red }}
          >
            <Text className="text-[14px] font-semibold text-red mb-1">
              Cancelled
            </Text>
            <Text className="text-[13px] text-secondary">
              By {booking.cancelledBy === 'client' ? 'you' : 'barber'} ·{' '}
              {formatRelativeTime(booking.cancelledAt)}
            </Text>
          </Card>
        )}

        {booking.noShowCharged && booking.noShowChargeAmountUsd && (
          <Card
            className="mt-4 p-4"
            style={{ borderLeftWidth: 3, borderLeftColor: colors.red }}
          >
            <Text className="text-[14px] font-semibold text-red mb-1">
              No-Show Charge
            </Text>
            <Text className="text-[13px] text-secondary">
              {formatCurrency(booking.noShowChargeAmountUsd)} charged for
              missing this appointment.
            </Text>
          </Card>
        )}

        {booking.review && (
          <Card className="mt-4 p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Icon name="star" size={14} color="#F5A623" />
              <Text className="text-[14px] font-semibold text-ink">
                Your Review · {booking.review.rating}/5
              </Text>
            </View>
            {booking.review.comment && (
              <Text className="text-[13px] text-secondary leading-[19px]">
                {booking.review.comment}
              </Text>
            )}
          </Card>
        )}

        <View className="mt-6 gap-[10px]">
          {canCancel && (
            <Btn
              label={cancelling ? 'Cancelling...' : 'Cancel Booking'}
              variant="danger"
              full
              onPress={handleCancel}
              disabled={cancelling}
            />
          )}
          {canReview && (
            <Btn
              label="Leave a Review"
              variant="secondary"
              full
              icon="star"
              onPress={() =>
                router.push({
                  pathname: '/(app)/(tabs)/bookings/review',
                  params: { bookingId: booking.id },
                })
              }
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
