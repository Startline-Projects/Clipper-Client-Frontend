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
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import TextArea from '@/components/forms/TextArea';
import { confirm } from '@/lib/feedback/confirm';
import {
  useArrangementDetail,
  useAcceptArrangement,
  useRejectArrangement,
} from '@/lib/hooks/useArrangements';
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

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Every week',
  biweekly: 'Every 2 weeks',
  every_n_weeks: 'Custom interval',
  monthly: 'Monthly',
};

const END_TYPE_LABELS: Record<string, string> = {
  none: 'No end date',
  after_count: 'After set number',
  on_date: 'Until date',
};

export default function ArrangementDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { arrangementId } = useLocalSearchParams<{ arrangementId: string }>();
  const { data: arrangement, isLoading, isRefetching, refetch } = useArrangementDetail(arrangementId);
  const accept = useAcceptArrangement();
  const reject = useRejectArrangement();

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (isLoading || !arrangement) return <LoadingSpinner />;

  const isPending = arrangement.status === 'pending_client_approval';

  const handleAccept = async () => {
    const yes = await confirm({
      title: 'Accept Arrangement',
      message: 'Accept this recurring arrangement from your barber?',
      confirmLabel: 'Accept',
    });
    if (yes) accept.mutate(arrangement.id);
  };

  const handleReject = () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    reject.mutate({
      id: arrangement.id,
      body: rejectReason.trim() ? { reason: rejectReason.trim() } : undefined,
    });
  };

  const frequencyLabel =
    arrangement.frequency === 'every_n_weeks' && arrangement.intervalN
      ? `Every ${arrangement.intervalN} weeks`
      : FREQUENCY_LABELS[arrangement.frequency] ?? arrangement.frequency;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Arrangement" onBack={() => router.back()} />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Barber info */}
        <Card className="p-5 mb-4">
          <View className="flex-row items-center gap-3 pb-4 mb-4 border-b border-separator">
            <Avatar
              name={arrangement.barber.name}
              size={48}
              uri={arrangement.barber.avatarUrl ?? undefined}
            />
            <View className="flex-1">
              <Text className="text-[16px] font-semibold text-ink tracking-[-0.2px]">
                {arrangement.barber.name}
              </Text>
              {arrangement.barber.shopName && (
                <Text className="text-[12px] text-tertiary mt-[2px]">
                  {arrangement.barber.shopName}
                </Text>
              )}
              <View className="mt-1">
                <StatusBadge status={arrangement.status} />
              </View>
            </View>
          </View>

          {/* Schedule details */}
          {[
            { label: 'Day', value: DAY_NAMES[arrangement.dayOfWeek] },
            { label: 'Time', value: formatTime(arrangement.timeOfDay) },
            { label: 'Frequency', value: frequencyLabel },
            { label: 'Start Date', value: formatDate(arrangement.startDate) },
            { label: 'End', value: END_TYPE_LABELS[arrangement.endType] ?? arrangement.endType },
            ...(arrangement.endType === 'after_count' && arrangement.endCount
              ? [{ label: 'Sessions', value: `${arrangement.endCount}` }]
              : []),
            ...(arrangement.endType === 'on_date' && arrangement.endDate
              ? [{ label: 'End Date', value: formatDate(arrangement.endDate) }]
              : []),
            { label: 'Duration', value: formatDuration(arrangement.totalDurationMinutes) },
            { label: 'Price', value: formatCurrency(arrangement.priceUsd) },
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
        </Card>

        {/* Services */}
        <Text className="text-[16px] font-bold text-ink tracking-[-0.2px] mb-2">
          Services
        </Text>
        <Card className="p-4 mb-4">
          {arrangement.services
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((svc) => (
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

        {/* Note from barber */}
        {arrangement.noteToClient && (
          <Card className="p-4 mb-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Icon name="chat" size={14} color={colors.secondary} />
              <Text className="text-[13px] font-semibold text-secondary">
                Note from barber
              </Text>
            </View>
            <Text className="text-[14px] text-ink leading-[20px]">
              {arrangement.noteToClient}
            </Text>
          </Card>
        )}

        {/* Rejection reason */}
        {arrangement.rejectionReason && (
          <Card
            className="p-4 mb-4"
            style={{ borderLeftWidth: 3, borderLeftColor: colors.red }}
          >
            <Text className="text-[13px] font-semibold text-red mb-1">
              Rejection Reason
            </Text>
            <Text className="text-[13px] text-secondary">
              {arrangement.rejectionReason}
            </Text>
          </Card>
        )}

        {/* Upcoming occurrences */}
        {arrangement.nextOccurrences.length > 0 && (
          <View className="mb-4">
            <Text className="text-[16px] font-bold text-ink tracking-[-0.2px] mb-2">
              Upcoming
            </Text>
            {arrangement.nextOccurrences.map((dateStr, index) => (
              <Card key={`${dateStr}-${index}`} className="mb-[6px] py-3">
                <Text className="text-[14px] text-ink">
                  {formatDate(dateStr.slice(0, 10))} at{' '}
                  {formatTime(dateStr.slice(11, 16))}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* Actions */}
        {isPending && (
          <View className="gap-[10px] mt-2">
            {showRejectInput && (
              <View className="mb-2">
                <TextArea
                  label="Reason (optional)"
                  placeholder="Why are you declining?"
                  placeholderTextColor={colors.tertiary}
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  maxLength={1000}
                />
              </View>
            )}

            <Btn
              label={accept.isPending ? 'Accepting...' : 'Accept Arrangement'}
              variant="primary"
              full
              icon="check"
              onPress={handleAccept}
              disabled={accept.isPending || reject.isPending}
            />
            <Btn
              label={
                reject.isPending
                  ? 'Declining...'
                  : showRejectInput
                    ? 'Confirm Decline'
                    : 'Decline'
              }
              variant="danger"
              full
              onPress={handleReject}
              disabled={accept.isPending || reject.isPending}
            />
            {showRejectInput && (
              <Btn
                label="Cancel"
                variant="ghost"
                full
                onPress={() => {
                  setShowRejectInput(false);
                  setRejectReason('');
                }}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
