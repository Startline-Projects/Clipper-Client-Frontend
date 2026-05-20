import { useState, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Badge from '@/components/ui/Badge';
import { SkeletonList } from '@/components/feedback/Skeleton';
import { useRecurringSlots, useCreateRecurring } from '@/lib/hooks/useRecurring';
import { useColors } from '@/lib/theme/colors';
import { formatTime, formatCurrency, formatDuration } from '@/lib/utils/format';
import { showSuccessToast, showErrorToast } from '@/lib/feedback/toast';
import { useFiltersStore } from '@/lib/stores/filters';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function RecurringSlotsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { barberId, serviceIds: serviceIdsParam } = useLocalSearchParams<{
    barberId: string;
    serviceIds: string;
  }>();
  const serviceIds = serviceIdsParam?.split(',').filter(Boolean) ?? [];

  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | null>(null);

  const upcomingDates = useMemo(() => {
    if (dayOfWeek === undefined) return [];
    const dates: { date: Date; dateStr: string }[] = [];
    const d = new Date();
    while (dates.length < 8) {
      if (d.getDay() === dayOfWeek) {
        dates.push({ date: new Date(d), dateStr: d.toISOString().slice(0, 10) });
      }
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }, [dayOfWeek]);

  const { data: slotData, isLoading: slotsLoading } = useRecurringSlots(
    barberId,
    serviceIds,
    dayOfWeek,
    startDate ?? undefined,
  );
  const create = useCreateRecurring();

  const canSubmit =
    dayOfWeek !== undefined && selectedSlot && frequency && barberId;

  const handleSubmit = () => {
    if (!canSubmit || create.isPending) return;
    create.mutate(
      {
        barberId,
        services: serviceIds.map((id) => ({
          barberServiceId: id,
          bookingType: 'regular' as const,
        })),
        dayOfWeek: dayOfWeek!,
        slotTime: selectedSlot!,
        frequency: frequency!,
        ...(startDate && { startDate }),
      },
      {
        onSuccess: () => {
          showSuccessToast('Recurring request submitted!');
          useFiltersStore.getState().setBookingsTab('Recurring');
          if (router.canDismiss()) router.dismissAll();
          router.replace('/(app)/(tabs)/bookings');
        },
        onError: (err) => showErrorToast(err),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Recurring Booking" onBack={() => router.back()} />
      </View>

      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        {/* Step 1: Day of week */}
        <Text className="text-[22px] font-bold text-ink tracking-[-0.5px] mt-1 mb-[2px]">
          Choose a day
        </Text>
        <Text className="text-[14px] text-secondary mb-4">
          Pick which day of the week you want your recurring slot.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-[10px] pb-2"
          className="mb-6"
        >
          {DAY_ORDER.map((dow) => {
            const isSel = dayOfWeek === dow;
            return (
              <Pressable
                key={dow}
                onPress={() => {
                  setDayOfWeek(dow);
                  setStartDate(null);
                  setSelectedSlot(null);
                  setFrequency(null);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSel }}
                accessibilityLabel={DAY_NAMES_SHORT[dow]}
                style={{
                  borderWidth: isSel ? 2 : 1,
                  borderColor: isSel ? colors.badgeRecurring : colors.separatorOpaque,
                  backgroundColor: isSel ? colors.badgeRecurring : colors.card,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  alignItems: 'center',
                  minWidth: 56,
                }}
                className="active:opacity-70"
              >
                <Text
                  style={{ color: isSel ? colors.white : colors.ink }}
                  className="text-[13px] font-bold"
                >
                  {DAY_NAMES_SHORT[dow]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Step 2: Start date */}
        {dayOfWeek !== undefined && (
          <>
            <Text className="text-[18px] font-bold text-ink tracking-[-0.3px] mb-[2px]">
              Start from
            </Text>
            <Text className="text-[14px] text-secondary mb-4">
              When should the series begin?
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-[8px] pb-2"
              className="mb-6"
            >
              <Pressable
                onPress={() => {
                  setStartDate(null);
                  setSelectedSlot(null);
                  setFrequency(null);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: startDate === null }}
                accessibilityLabel="Soonest available"
                style={{
                  borderWidth: startDate === null ? 2 : 1,
                  borderColor: startDate === null ? colors.badgeRecurring : colors.separatorOpaque,
                  backgroundColor: startDate === null ? colors.badgeRecurring : colors.card,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  alignItems: 'center',
                }}
                className="active:opacity-70"
              >
                <Text
                  style={{ color: startDate === null ? colors.white : colors.ink }}
                  className="text-[13px] font-bold"
                >
                  Soonest
                </Text>
              </Pressable>
              {upcomingDates.map(({ date, dateStr }) => {
                const isSel = startDate === dateStr;
                return (
                  <Pressable
                    key={dateStr}
                    onPress={() => {
                      setStartDate(dateStr);
                      setSelectedSlot(null);
                      setFrequency(null);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSel }}
                    accessibilityLabel={date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    style={{
                      borderWidth: isSel ? 2 : 1,
                      borderColor: isSel ? colors.badgeRecurring : colors.separatorOpaque,
                      backgroundColor: isSel ? colors.badgeRecurring : colors.card,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      alignItems: 'center',
                    }}
                    className="active:opacity-70"
                  >
                    <Text
                      style={{ color: isSel ? colors.white : colors.ink }}
                      className="text-[13px] font-bold"
                    >
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Step 3: Time slot */}
            <Text className="text-[18px] font-bold text-ink tracking-[-0.3px] mb-[2px]">
              Pick a time
            </Text>
            {slotsLoading ? (
              <SkeletonList count={4} height={52} />
            ) : !slotData || !slotData.recurringAvailable ? (
              <Card className="p-5 items-center mb-6" style={{ backgroundColor: colors.bgWarm }}>
                <Icon name="calendarOff" size={24} color={colors.tertiary} />
                <Text className="text-[13px] font-medium text-secondary mt-2">
                  Not available for recurring on {DAY_NAMES_LONG[dayOfWeek]}
                </Text>
              </Card>
            ) : (
              <>
                <Text className="text-[14px] text-secondary mb-4">
                  {DAY_NAMES_LONG[dayOfWeek]} ·{' '}
                  {formatDuration(slotData.totalDurationMinutes)}
                  {slotData.recurringPriceUsd
                    ? ` · ${formatCurrency(slotData.recurringPriceUsd)}/session`
                    : ''}
                </Text>

                <View className="gap-2 mb-6">
                  {slotData.slots.map((slot) => {
                    const isSel = selectedSlot === slot.time;
                    return (
                      <Pressable
                        key={slot.time}
                        onPress={() => slot.available && setSelectedSlot(slot.time)}
                        disabled={!slot.available}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSel, disabled: !slot.available }}
                        accessibilityLabel={`${formatTime(slot.time)}${!slot.available ? ', taken' : ''}`}
                        style={{
                          backgroundColor: isSel
                            ? colors.badgeRecurring
                            : !slot.available
                              ? colors.bgWarm
                              : colors.card,
                          borderWidth: isSel ? 0 : 1,
                          borderColor: colors.separatorOpaque,
                          opacity: slot.available ? 1 : 0.45,
                        }}
                        className="flex-row items-center justify-between p-[14px] rounded-lg active:opacity-70"
                      >
                        <View className="flex-row items-center gap-[10px]">
                          <Icon
                            name="clock"
                            size={16}
                            color={
                              isSel
                                ? colors.white
                                : slot.available
                                  ? colors.secondary
                                  : colors.tertiary
                            }
                          />
                          <Text
                            style={{
                              color: isSel
                                ? colors.white
                                : slot.available
                                  ? colors.ink
                                  : colors.tertiary,
                            }}
                            className="text-[15px] font-medium"
                          >
                            {formatTime(slot.time)}
                          </Text>
                        </View>
                        {!slot.available && (
                          <Badge label="Taken" color={colors.tertiary} bg={colors.bgMuted} />
                        )}
                        {isSel && <Icon name="check" size={18} color="#fff" />}
                      </Pressable>
                    );
                  })}
                </View>

                {/* Step 4: Frequency */}
                {selectedSlot && (
                  <>
                    <Text className="text-[18px] font-bold text-ink tracking-[-0.3px] mb-[2px]">
                      How often?
                    </Text>
                    <Text className="text-[14px] text-secondary mb-4">
                      {DAY_NAMES_LONG[dayOfWeek]} · {formatTime(selectedSlot)}
                    </Text>

                    <View className="gap-[10px] mb-6">
                      {(['weekly', 'biweekly'] as const).map((f) => {
                        const allowed =
                          slotData.recurringFrequencyOptions.includes(f);
                        const isSel = frequency === f;
                        return (
                          <Pressable
                            key={f}
                            onPress={() => allowed && setFrequency(f)}
                            disabled={!allowed}
                            accessibilityRole="radio"
                            accessibilityState={{ selected: isSel, disabled: !allowed }}
                            accessibilityLabel={f === 'weekly' ? 'Every week' : 'Every 2 weeks'}
                            style={{
                              borderWidth: isSel ? 2 : 1,
                              borderColor: isSel ? colors.badgeRecurring : colors.separatorOpaque,
                              backgroundColor: isSel ? colors.recurringPale : colors.card,
                              opacity: allowed ? 1 : 0.4,
                            }}
                            className="p-[18px] rounded-lg active:opacity-70"
                          >
                            <View className="flex-row justify-between items-center">
                              <View>
                                <Text
                                  style={{ color: isSel ? colors.badgeRecurring : colors.ink }}
                                  className="text-[16px] font-semibold"
                                >
                                  {f === 'weekly' ? 'Every week' : 'Every 2 weeks'}
                                </Text>
                                <Text className="text-[12px] text-secondary mt-1">
                                  {f === 'weekly'
                                    ? '4 appointments per month'
                                    : '2 appointments per month'}
                                </Text>
                              </View>
                              {isSel && (
                                <Icon name="check" size={20} color={colors.badgeRecurring} />
                              )}
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                )}
              </>
            )}
          </>
        )}

        <Btn
          label={create.isPending ? 'Submitting...' : 'Submit Request'}
          full
          onPress={handleSubmit}
          disabled={!canSubmit || create.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
