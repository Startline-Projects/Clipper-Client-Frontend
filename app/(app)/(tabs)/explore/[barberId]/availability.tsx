import { useEffect, useMemo } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import ServiceSelector from '@/components/booking/ServiceSelector';
import DateStrip from '@/components/booking/DateStrip';
import SlotGrid from '@/components/booking/SlotGrid';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import { useBarberDetail } from '@/lib/hooks/useBarbers';
import { useAvailability } from '@/lib/hooks/useAvailability';
import { usePreviewBooking } from '@/lib/hooks/useBookingFlow';
import { useBookingFlowStore } from '@/lib/stores/booking-flow';
import { useLocation } from '@/lib/hooks/useLocation';
import { useColors } from '@/lib/theme/colors';
import { formatDuration } from '@/lib/utils/format';

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function AvailabilityScreen() {
  const router = useRouter();
  const colors = useColors();
  const { barberId } = useLocalSearchParams<{ barberId: string }>();
  const { latitude, longitude } = useLocation();
  const coords =
    latitude !== null && longitude !== null ? { latitude, longitude } : null;
  const { data: detail } = useBarberDetail(barberId, coords);

  const selectedServices = useBookingFlowStore((s) => s.selectedServices);
  const selectedDate = useBookingFlowStore((s) => s.selectedDate);
  const selectedSlot = useBookingFlowStore((s) => s.selectedSlot);
  const setBarberId = useBookingFlowStore((s) => s.setBarberId);
  const addService = useBookingFlowStore((s) => s.addService);
  const removeService = useBookingFlowStore((s) => s.removeService);
  const setDate = useBookingFlowStore((s) => s.setDate);
  const setSlot = useBookingFlowStore((s) => s.setSlot);
  const preview = usePreviewBooking();

  const reset = useBookingFlowStore((s) => s.reset);

  useEffect(() => {
    reset();
  }, [barberId]);

  useEffect(() => {
    if (detail && barberId) {
      setBarberId(barberId, detail.barber.name);
    }
  }, [detail, barberId, setBarberId]);

  const startDate = useMemo(() => new Date(), []);
  const endDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 13);
    return toDateString(d);
  }, []);

  const serviceIds = selectedServices.map((s) => s.barberServiceId);

  const { data: availability, isLoading: availLoading } = useAvailability(
    barberId,
    serviceIds,
    toDateString(startDate),
    endDate,
  );

  const selectedDay = availability?.days.find((d) => d.date === selectedDate);
  const totalDuration = availability?.totalDurationMinutes ?? 0;

  const handleToggleService = (serviceId: string) => {
    if (selectedServices.some((s) => s.barberServiceId === serviceId)) {
      removeService(serviceId);
    } else {
      addService({ barberServiceId: serviceId, bookingType: 'regular' });
    }
  };

  const canPreview =
    selectedServices.length > 0 && selectedDate && selectedSlot;

  const handlePreview = () => {
    if (!canPreview) return;
    preview.mutate(undefined, {
      onSuccess: () =>
        router.push(`/(app)/(tabs)/explore/${barberId}/preview`),
      onError: () =>
        Alert.alert('Preview failed', 'Could not load booking preview. Try again.'),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Book Appointment" onBack={() => router.back()} />
      </View>

      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        <Text className="text-[22px] font-bold text-ink tracking-[-0.5px] mt-1 mb-[2px]">
          Choose services
        </Text>
        <Text className="text-[14px] text-secondary mb-4">
          Stack up to 4 — they run back-to-back.{' '}
          {selectedServices.length}/4 selected
          {totalDuration > 0 ? ` · ${formatDuration(totalDuration)}` : ''}
        </Text>

        {detail ? (
          <ServiceSelector
            services={detail.services}
            selected={serviceIds}
            onToggle={handleToggleService}
          />
        ) : (
          <LoadingSpinner size="small" />
        )}

        {selectedServices.length > 0 && (
          <>
            <Text className="text-[18px] font-bold text-ink tracking-[-0.3px] mt-7 mb-3">
              Pick a date
            </Text>
            <DateStrip
              startDate={startDate}
              selectedDate={selectedDate}
              onSelect={setDate}
            />

            {selectedDate && (
              <>
                <Text className="text-[18px] font-bold text-ink tracking-[-0.3px] mt-6 mb-3">
                  Pick a time
                </Text>

                {availLoading ? (
                  <LoadingSpinner size="small" />
                ) : selectedDay ? (
                  <View className="gap-5">
                    {selectedDay.slots.regular.length > 0 && (
                      <View>
                        <Text className="text-[13px] font-semibold text-secondary mb-[10px]">
                          Regular Hours
                        </Text>
                        <SlotGrid
                          slots={selectedDay.slots.regular}
                          selectedSlot={selectedSlot}
                          onSelect={setSlot}
                          tier="regular"
                        />
                      </View>
                    )}
                    {selectedDay.slots.afterHours.length > 0 && (
                      <View>
                        <Text className="text-[13px] font-semibold text-secondary mb-[10px]">
                          After Hours
                        </Text>
                        <SlotGrid
                          slots={selectedDay.slots.afterHours}
                          selectedSlot={selectedSlot}
                          onSelect={setSlot}
                          tier="afterHours"
                        />
                      </View>
                    )}
                    {selectedDay.slots.dayOff.length > 0 && (
                      <View>
                        <Text className="text-[13px] font-semibold text-secondary mb-[10px]">
                          Day Off
                        </Text>
                        <SlotGrid
                          slots={selectedDay.slots.dayOff}
                          selectedSlot={selectedSlot}
                          onSelect={setSlot}
                          tier="dayOff"
                        />
                      </View>
                    )}
                    {selectedDay.slots.regular.length === 0 &&
                      selectedDay.slots.afterHours.length === 0 &&
                      selectedDay.slots.dayOff.length === 0 && (
                        <View className="items-center py-6 bg-bg-warm rounded-lg">
                          <Text className="text-[13px] font-medium text-secondary">
                            No slots available on this day
                          </Text>
                        </View>
                      )}
                  </View>
                ) : null}
              </>
            )}
          </>
        )}

        <View className="mt-6">
          <Btn
            label={preview.isPending ? 'Loading preview...' : 'Preview Booking'}
            full
            onPress={handlePreview}
            disabled={!canPreview || preview.isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
