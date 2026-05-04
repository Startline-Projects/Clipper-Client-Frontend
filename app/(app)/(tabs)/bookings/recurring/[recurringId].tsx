import { Alert, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import {
  useRecurringDetail,
  usePauseRecurring,
  useResumeRecurring,
  useCancelRecurring,
  useRenewRecurring,
} from '@/lib/hooks/useRecurring';
import { useColors } from '@/lib/theme/colors';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDuration,
} from '@/lib/utils/format';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function RecurringDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { recurringId } = useLocalSearchParams<{ recurringId: string }>();
  const { data: recurring, isLoading } = useRecurringDetail(recurringId);
  const pause = usePauseRecurring();
  const resume = useResumeRecurring();
  const cancelRecurring = useCancelRecurring();
  const renew = useRenewRecurring();

  if (isLoading || !recurring) return <LoadingSpinner />;

  const isActive = recurring.status === 'active';
  const isPaused = recurring.status === 'paused';
  const isCancelled = recurring.status === 'cancelled';
  const isExpired = recurring.status === 'expired';
  const isPending = recurring.status === 'pending_barber_approval';

  const handlePause = () => {
    const today = new Date().toISOString().slice(0, 10);
    pause.mutate({ id: recurring.id, body: { pauseStartDate: today } });
  };

  const handleResume = () => {
    resume.mutate(recurring.id);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Recurring Booking',
      'This will cancel all future appointments in this recurring series.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Series',
          style: 'destructive',
          onPress: () => cancelRecurring.mutate(recurring.id),
        },
      ],
    );
  };

  const handleRenew = () => {
    renew.mutate(recurring.id, {
      onError: () =>
        Alert.alert('Renew failed', 'Could not renew. Please try again.'),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Recurring Detail" onBack={() => router.back()} />
      </View>

      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        <Card className="p-5 mb-4">
          <View className="flex-row items-center gap-2 mb-4">
            <StatusBadge status={recurring.status} />
            {recurring.isRenewal && (
              <Text className="text-[11px] text-tertiary">Renewal</Text>
            )}
          </View>

          {[
            { label: 'Barber', value: recurring.barber.name },
            { label: 'Service', value: recurring.service.name },
            {
              label: 'Frequency',
              value: recurring.frequency === 'weekly' ? 'Every week' : 'Every 2 weeks',
            },
            { label: 'Day', value: DAY_NAMES[recurring.dayOfWeek] },
            { label: 'Time', value: formatTime(recurring.slotTime) },
            { label: 'Duration', value: formatDuration(recurring.totalDurationMinutes) },
            { label: 'Price', value: formatCurrency(recurring.priceUsd) },
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

          {isPaused && recurring.pauseStartDate && (
            <View className="mt-3 p-3 bg-orange/5 rounded-md">
              <Text className="text-[13px] text-orange font-medium">
                Paused since {formatDate(recurring.pauseStartDate)}
                {recurring.pauseEndDate
                  ? ` · resumes ${formatDate(recurring.pauseEndDate)}`
                  : ''}
              </Text>
            </View>
          )}

          {isPending && (
            <View className="mt-3 p-3 bg-yellow/5 rounded-md flex-row items-center gap-2">
              <Icon name="clock" size={14} color={colors.yellow} />
              <Text className="text-[13px] text-secondary">
                Waiting for barber to accept this recurring request
              </Text>
            </View>
          )}

          {recurring.barberDeclinedAt && recurring.declinedReason && (
            <View
              className="mt-3 p-3 rounded-md"
              style={{ backgroundColor: colors.red + '08' }}
            >
              <Text className="text-[13px] font-medium text-red mb-1">
                Declined by barber
              </Text>
              <Text className="text-[12px] text-secondary">
                {recurring.declinedReason}
              </Text>
            </View>
          )}
        </Card>

        {recurring.upcomingOccurrences.length > 0 && (
          <View className="mb-4">
            <Text className="text-[16px] font-bold text-ink tracking-[-0.2px] mb-2">
              Upcoming
            </Text>
            {recurring.upcomingOccurrences.map((occ) => (
              <Card
                key={occ.bookingId}
                className="mb-[6px] py-3"
                onPress={() =>
                  router.push(`/(app)/(tabs)/bookings/${occ.bookingId}`)
                }
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-[14px] text-ink">
                    {formatDate(occ.scheduledAt.slice(0, 10))}
                  </Text>
                  <StatusBadge status={occ.status} />
                </View>
              </Card>
            ))}
          </View>
        )}

        {recurring.pastOccurrences.length > 0 && (
          <View className="mb-4">
            <Text className="text-[16px] font-bold text-ink tracking-[-0.2px] mb-2">
              Past
            </Text>
            {recurring.pastOccurrences.map((occ) => (
              <Card
                key={occ.bookingId}
                className="mb-[6px] py-3"
                onPress={() =>
                  router.push(`/(app)/(tabs)/bookings/${occ.bookingId}`)
                }
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-[14px] text-secondary">
                    {formatDate(occ.scheduledAt.slice(0, 10))}
                  </Text>
                  <StatusBadge status={occ.status} />
                </View>
              </Card>
            ))}
          </View>
        )}

        <View className="gap-[10px] mt-2">
          {isActive && (
            <>
              <Btn
                label={pause.isPending ? 'Pausing...' : 'Pause'}
                variant="secondary"
                full
                icon="pause"
                onPress={handlePause}
                disabled={pause.isPending}
              />
              <Btn
                label="Cancel Series"
                variant="danger"
                full
                onPress={handleCancel}
                disabled={cancelRecurring.isPending}
              />
            </>
          )}
          {isPaused && (
            <>
              <Btn
                label={resume.isPending ? 'Resuming...' : 'Resume'}
                variant="primary"
                full
                onPress={handleResume}
                disabled={resume.isPending}
              />
              <Btn
                label="Cancel Series"
                variant="danger"
                full
                onPress={handleCancel}
                disabled={cancelRecurring.isPending}
              />
            </>
          )}
          {(isCancelled || isExpired) && (
            <Btn
              label={renew.isPending ? 'Renewing...' : 'Renew'}
              variant="primary"
              full
              icon="repeat"
              onPress={handleRenew}
              disabled={renew.isPending}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
