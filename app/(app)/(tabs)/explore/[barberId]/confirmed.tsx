import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@/components/ui/Icon';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { useBookingDetail } from '@/lib/hooks/useBookings';
import { useBarberChat } from '@/lib/hooks/useBarberChat';
import { useColors } from '@/lib/theme/colors';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDuration,
} from '@/lib/utils/format';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-[10px] border-b-[0.5px] border-separator">
      <Text className="text-[14px] text-secondary">{label}</Text>
      <Text className="text-[14px] font-semibold text-ink">{value}</Text>
    </View>
  );
}

export default function ConfirmedScreen() {
  const router = useRouter();
  const colors = useColors();
  const { bookingId, barberId } = useLocalSearchParams<{
    bookingId: string;
    barberId: string;
  }>();
  const { data: booking } = useBookingDetail(bookingId);

  const bName = booking?.barber?.name ?? '';
  const { openChat, isPending: chatPending } = useBarberChat(
    barberId ?? '',
    bName,
  );

  const isAutoConfirmed = booking?.status === 'confirmed';

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8 pt-4">
        <View className="items-center mb-6">
          <View className="w-[72px] h-[72px] rounded-full bg-green/10 items-center justify-center mb-4">
            <Icon name="check" size={36} color={colors.green} />
          </View>
          <Text className="text-[24px] font-extrabold text-ink tracking-[-0.6px] mb-1">
            {isAutoConfirmed ? 'Booking Confirmed' : 'Booking Submitted'}
          </Text>
          <Text className="text-[14px] text-secondary text-center leading-[21px] tracking-[-0.1px] px-4">
            {isAutoConfirmed
              ? "You're all set! See you at your appointment."
              : "Your appointment has been submitted. You'll get a notification once your barber confirms."}
          </Text>
        </View>

        {booking && (
          <>
            <Card className="p-5 mb-4">
              <View className="flex-row items-center gap-3 pb-4 mb-3 border-b border-separator">
                <Avatar
                  name={booking.barber.name}
                  size={48}
                  uri={booking.barber.profilePhotoUrl ?? undefined}
                />
                <View>
                  <Text className="text-[16px] font-semibold text-ink tracking-[-0.2px]">
                    {booking.barber.name}
                  </Text>
                </View>
              </View>

              <InfoRow label="Date" value={formatDate(booking.scheduledAt.slice(0, 10))} />
              <InfoRow label="Time" value={formatTime(booking.scheduledAt.slice(11, 16))} />
              <InfoRow label="Duration" value={formatDuration(booking.totalDurationMinutes)} />
              <InfoRow label="Total" value={formatCurrency(booking.totalPrice)} />
            </Card>

            {booking.services && booking.services.length > 0 && (
              <Card className="p-4 mb-4">
                {booking.services.map((svc) => (
                  <View
                    key={svc.id}
                    className="flex-row justify-between py-[10px] border-b-[0.5px] border-separator last:border-b-0"
                  >
                    <View className="flex-1 mr-3">
                      <Text className="text-[14px] text-ink">{svc.name}</Text>
                      <Text className="text-[12px] text-tertiary mt-[2px]">
                        {formatDuration(svc.durationMinutes)}
                      </Text>
                    </View>
                    <Text className="text-[14px] font-semibold text-ink">
                      {formatCurrency(svc.pricing.totalPrice)}
                    </Text>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}

        <View className="gap-[10px] mt-2">
          <Btn
            label="Message Barber"
            variant="secondary"
            full
            icon="chat"
            onPress={openChat}
            disabled={chatPending}
          />
          {bookingId && (
            <Btn
              label="View Booking"
              full
              onPress={() =>
                router.replace(`/(app)/(tabs)/bookings/${bookingId}`)
              }
            />
          )}
          <Btn
            label="Back to Home"
            variant="ghost"
            full
            onPress={() => router.replace('/(app)/(tabs)/home')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
