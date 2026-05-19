import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import PriceBreakdown from '@/components/booking/PriceBreakdown';
import { useConfirmBooking } from '@/lib/hooks/useBookingFlow';
import { useBarberDetail } from '@/lib/hooks/useBarbers';
import { useBookingFlowStore } from '@/lib/stores/booking-flow';
import { useLocation } from '@/lib/hooks/useLocation';
import { useColors } from '@/lib/theme/colors';
import { showErrorToast, showToast } from '@/lib/feedback/toast';
import { mapApiError } from '@/lib/api/error-map';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDuration,
} from '@/lib/utils/format';

export default function PreviewScreen() {
  const router = useRouter();
  const colors = useColors();
  const { barberId } = useLocalSearchParams<{ barberId: string }>();
  const { latitude, longitude } = useLocation();
  const coords =
    latitude !== null && longitude !== null ? { latitude, longitude } : null;
  const { data: detail } = useBarberDetail(barberId, coords);

  const previewData = useBookingFlowStore((s) => s.previewData);
  const selectedDate = useBookingFlowStore((s) => s.selectedDate);
  const selectedSlot = useBookingFlowStore((s) => s.selectedSlot);
  const confirmBooking = useConfirmBooking();
  const reset = useBookingFlowStore((s) => s.reset);

  useEffect(() => {
    if (!previewData && !confirmBooking.isPending && !confirmBooking.isSuccess)
      router.back();
  }, [previewData, confirmBooking.isPending, confirmBooking.isSuccess, router]);

  if (!previewData) return null;

  const handleConfirm = () => {
    if (confirmBooking.isPending) return;
    confirmBooking.mutate(undefined, {
      onSuccess: (res) => {
        reset();
        router.replace({
          pathname: '/(app)/(tabs)/explore/[barberId]/confirmed',
          params: { barberId, bookingId: res.booking.id },
        });
      },
      onError: (err: any) => {
        const mapped = mapApiError(err);
        if (mapped.isEmailNotVerified) {
          showToast({ variant: 'info', title: mapped.title, message: mapped.message });
          router.push('/(app)/verify-email');
        } else if (err?.status === 409) {
          showErrorToast(null, 'Someone just booked this slot — pick another time.');
        } else {
          showErrorToast(err, 'Booking failed. Please try again.');
        }
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Review & Confirm" onBack={() => router.back()} />
      </View>

      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        <Card className="p-5 mb-4">
          <View className="flex-row items-center gap-[14px] pb-4 mb-4 border-b border-separator">
            <Avatar
              name={previewData.barber.name}
              size={52}
              uri={detail?.barber.profileImage ?? undefined}
            />
            <View>
              <Text className="text-[16px] font-semibold text-ink tracking-[-0.2px]">
                {previewData.barber.name}
              </Text>
              {detail && (
                <Text className="text-[12px] text-tertiary mt-[2px]">
                  {detail.distance.miles} mi away
                </Text>
              )}
            </View>
          </View>

          <View>
            {[
              { label: 'Date', value: selectedDate ? formatDate(selectedDate) : '—' },
              { label: 'Time', value: selectedSlot ? formatTime(selectedSlot) : '—' },
              { label: 'Duration', value: formatDuration(previewData.totalDurationMinutes) },
            ].map((row) => (
              <View
                key={row.label}
                className="flex-row justify-between py-[11px] border-b-[0.5px] border-separator"
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
          Price Breakdown
        </Text>
        <PriceBreakdown
          services={previewData.services}
          total={previewData.pricing}
        />

        <Card
          className="mt-3 p-3 border-0 shadow-none"
          style={{ backgroundColor: colors.bgWarm }}
        >
          <Text className="text-[12px] text-secondary leading-[18px]">
            Once submitted, your booking is pending until{' '}
            {previewData.barber.name} confirms — unless they have auto-confirm
            on, in which case it's confirmed instantly.
          </Text>
        </Card>

        <View className="mt-6">
          <Btn
            label={
              confirmBooking.isPending
                ? 'Confirming...'
                : `Confirm Booking — ${formatCurrency(previewData.pricing.totalPrice)}`
            }
            full
            onPress={handleConfirm}
            disabled={confirmBooking.isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
