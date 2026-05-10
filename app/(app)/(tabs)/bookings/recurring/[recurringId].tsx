import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import ErrorView from '@/components/feedback/ErrorView';
import { BookingDetailSkeleton } from '@/components/feedback/SkeletonVariants';
import PauseRecurringSheet from '@/components/booking/PauseRecurringSheet';
import CancelRecurringSheet from '@/components/booking/CancelRecurringSheet';
import {
  useRecurringDetail,
  usePauseRecurring,
  useResumeRecurring,
  useCancelRecurring,
  useRenewRecurring,
} from '@/lib/hooks/useRecurring';
import { useBarberChat } from '@/lib/hooks/useBarberChat';
import { useColors } from '@/lib/theme/colors';
import { showSuccessToast, showErrorToast } from '@/lib/feedback/toast';
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

function SectionHeader({ children }: { children: string }) {
  return (
    <Text className="text-[16px] font-bold text-ink tracking-[-0.2px] mb-2">
      {children}
    </Text>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-[10px] border-b-[0.5px] border-separator">
      <Text className="text-[14px] text-secondary">{label}</Text>
      <Text className="text-[14px] font-semibold text-ink">{value}</Text>
    </View>
  );
}

export default function RecurringDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { recurringId } = useLocalSearchParams<{ recurringId: string }>();
  const { data: recurring, isLoading, isError, error, refetch, isRefetching } =
    useRecurringDetail(recurringId);
  const pause = usePauseRecurring();
  const resume = useResumeRecurring();
  const cancelRecurring = useCancelRecurring();
  const renew = useRenewRecurring();

  const barberId = recurring?.barber?.id ?? '';
  const barberName = recurring?.barber?.name ?? '';
  const { openChat, isPending: chatPending } = useBarberChat(
    barberId,
    barberName,
  );

  const [showPauseSheet, setShowPauseSheet] = useState(false);
  const [showCancelSheet, setShowCancelSheet] = useState(false);

  if (isLoading) return <BookingDetailSkeleton />;
  if (isError || !recurring)
    return <ErrorView error={error} onRetry={refetch} />;

  const isActive = recurring.status === 'active';
  const isPaused = recurring.status === 'paused';
  const isCancelled = recurring.status === 'cancelled';
  const isExpired = recurring.status === 'expired';
  const isPending = recurring.status === 'pending_barber_approval';
  const isRejected = recurring.status === 'rejected';

  const handlePause = (pauseEndDate?: string) => {
    const today = new Date().toISOString().slice(0, 10);
    pause.mutate(
      { id: recurring.id, body: { pauseStartDate: today, pauseEndDate } },
      {
        onSuccess: () => {
          showSuccessToast('Series paused');
          setShowPauseSheet(false);
        },
        onError: (err) => showErrorToast(err),
      },
    );
  };

  const handleResume = () => {
    resume.mutate(recurring.id, {
      onSuccess: () => showSuccessToast('Series resumed'),
      onError: (err) => showErrorToast(err),
    });
  };

  const handleCancel = () => {
    cancelRecurring.mutate(recurring.id, {
      onSuccess: () => {
        showSuccessToast('Series cancelled');
        setShowCancelSheet(false);
      },
      onError: (err) => showErrorToast(err),
    });
  };

  const handleRenew = () => {
    renew.mutate(recurring.id, {
      onSuccess: () => showSuccessToast('Series renewed!'),
      onError: (err) => showErrorToast(err),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Recurring Detail" onBack={() => router.back()} />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Header card */}
        <Card className="p-5 mb-4">
          <View className="flex-row items-center gap-3 pb-4 mb-4 border-b border-separator">
            <Avatar name={recurring.barber.name} size={48} />
            <View className="flex-1">
              <Text className="text-[16px] font-semibold text-ink tracking-[-0.2px]">
                {recurring.barber.name}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <StatusBadge status={recurring.status} />
                {recurring.isRenewal && (
                  <Text className="text-[11px] text-tertiary">Renewal</Text>
                )}
              </View>
            </View>
          </View>

          <InfoRow label="Service" value={recurring.service.name} />
          <InfoRow
            label="Frequency"
            value={
              recurring.frequency === 'weekly' ? 'Every week' : 'Every 2 weeks'
            }
          />
          <InfoRow label="Day" value={DAY_NAMES[recurring.dayOfWeek]} />
          <InfoRow label="Time" value={formatTime(recurring.slotTime)} />
          <InfoRow
            label="Duration"
            value={formatDuration(recurring.totalDurationMinutes)}
          />
          <InfoRow
            label="Price / session"
            value={formatCurrency(recurring.priceUsd)}
          />
        </Card>

        {/* Services */}
        {recurring.services && recurring.services.length > 0 && (
          <>
            <SectionHeader>Services</SectionHeader>
            <Card className="p-4 mb-4">
              {recurring.services.map((svc) => (
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
                    {formatCurrency(svc.priceUsd)}
                  </Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Status banners */}
        {isPending && (
          <Card
            className="p-4 mb-4"
            style={{ backgroundColor: colors.yellow + '0D' }}
          >
            <View className="flex-row items-center gap-2">
              <Icon name="clock" size={16} color={colors.yellow} />
              <Text className="text-[13px] text-secondary flex-1">
                Awaiting barber approval
              </Text>
            </View>
          </Card>
        )}

        {isPaused && (
          <Card
            className="p-4 mb-4"
            style={{ backgroundColor: colors.orange + '0D' }}
          >
            <View className="flex-row items-center gap-2">
              <Icon name="pause" size={16} color={colors.orange} />
              <View className="flex-1">
                <Text className="text-[13px] font-medium text-orange">
                  Series paused
                </Text>
                {recurring.pauseStartDate && (
                  <Text className="text-[12px] text-secondary mt-[2px]">
                    Since {formatDate(recurring.pauseStartDate)}
                    {recurring.pauseEndDate
                      ? ` · resumes ${formatDate(recurring.pauseEndDate)}`
                      : ''}
                  </Text>
                )}
              </View>
            </View>
          </Card>
        )}

        {isRejected && recurring.barberDeclinedAt && (
          <Card
            className="p-4 mb-4"
            style={{ backgroundColor: colors.red + '0D' }}
          >
            <View className="flex-row items-center gap-2">
              <Icon name="close" size={16} color={colors.red} />
              <View className="flex-1">
                <Text className="text-[13px] font-medium text-red">
                  Declined by barber
                </Text>
                {recurring.declinedReason && (
                  <Text className="text-[12px] text-secondary mt-[2px]">
                    {recurring.declinedReason}
                  </Text>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Upcoming occurrences */}
        {!isPending && recurring.upcomingOccurrences.length > 0 && (
          <View className="mb-4">
            <SectionHeader>Upcoming</SectionHeader>
            {recurring.upcomingOccurrences.map((occ) => (
              <Card
                key={occ.bookingId}
                className="mb-[6px] py-3"
                onPress={() =>
                  router.push(`/(app)/(tabs)/bookings/${occ.bookingId}`)
                }
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Icon name="calendar" size={14} color={colors.secondary} />
                    <Text className="text-[14px] text-ink">
                      {formatDate(occ.scheduledAt.slice(0, 10))}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <StatusBadge status={occ.status} />
                    <Icon name="chevron" size={14} color={colors.tertiary} />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Empty state for active with no upcoming */}
        {isActive && recurring.upcomingOccurrences.length === 0 && (
          <Card className="p-4 mb-4">
            <Text className="text-[13px] text-tertiary text-center">
              No upcoming appointments yet
            </Text>
          </Card>
        )}

        {/* Past occurrences */}
        {!isPending && recurring.pastOccurrences.length > 0 && (
          <View className="mb-4">
            <SectionHeader>Past</SectionHeader>
            {recurring.pastOccurrences.map((occ) => (
              <Card
                key={occ.bookingId}
                className="mb-[6px] py-3"
                onPress={() =>
                  router.push(`/(app)/(tabs)/bookings/${occ.bookingId}`)
                }
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Icon name="calendar" size={14} color={colors.tertiary} />
                    <Text className="text-[14px] text-secondary">
                      {formatDate(occ.scheduledAt.slice(0, 10))}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <StatusBadge status={occ.status} />
                    <Icon name="chevron" size={14} color={colors.tertiary} />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Actions */}
        <View className="gap-[10px] mt-2">
          {isActive && (
            <>
              <Btn
                label="Pause"
                variant="secondary"
                full
                icon="pause"
                onPress={() => setShowPauseSheet(true)}
              />
              <Btn
                label="Cancel Series"
                variant="danger"
                full
                onPress={() => setShowCancelSheet(true)}
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
                onPress={() => setShowCancelSheet(true)}
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
          <Btn
            label="Message Barber"
            variant="secondary"
            full
            icon="chat"
            onPress={openChat}
            disabled={chatPending}
          />
        </View>
      </ScrollView>

      <PauseRecurringSheet
        visible={showPauseSheet}
        onClose={() => setShowPauseSheet(false)}
        onPause={handlePause}
        isPending={pause.isPending}
      />
      <CancelRecurringSheet
        visible={showCancelSheet}
        onClose={() => setShowCancelSheet(false)}
        onCancel={handleCancel}
        isPending={cancelRecurring.isPending}
      />
    </SafeAreaView>
  );
}
