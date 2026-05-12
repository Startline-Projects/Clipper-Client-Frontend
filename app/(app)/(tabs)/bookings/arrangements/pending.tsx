import { useCallback } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Btn from '@/components/ui/Btn';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/feedback/EmptyState';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import {
  usePendingArrangements,
  useAcceptArrangement,
  useRejectArrangement,
} from '@/lib/hooks/useArrangements';
import { confirm } from '@/lib/feedback/confirm';
import { formatCurrency, formatTime } from '@/lib/utils/format';
import type { Arrangement } from '@/lib/api/arrangements';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  every_n_weeks: 'Custom',
  monthly: 'Monthly',
};

export default function PendingArrangementsScreen() {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePendingArrangements();
  const accept = useAcceptArrangement();
  const reject = useRejectArrangement();

  const arrangements = data?.pages.flatMap((p) => p.arrangements) ?? [];

  const handleAccept = useCallback(
    async (id: string) => {
      const yes = await confirm({
        title: 'Accept Arrangement',
        message: 'Accept this recurring arrangement?',
        confirmLabel: 'Accept',
      });
      if (yes) accept.mutate(id);
    },
    [accept],
  );

  const handleReject = useCallback(
    async (id: string) => {
      const yes = await confirm({
        title: 'Decline Arrangement',
        message: 'Decline this recurring arrangement?',
        confirmLabel: 'Decline',
        destructive: true,
      });
      if (yes) reject.mutate({ id });
    },
    [reject],
  );

  const renderItem = useCallback(
    ({ item }: { item: Arrangement }) => {
      const serviceNames = item.services.map((s) => s.name).join(', ');
      return (
        <View className="px-5 mb-3">
          <Card className="p-4 border-yellow/30">
            <Pressable
              onPress={() =>
                router.push(`/(app)/(tabs)/bookings/arrangements/${item.id}`)
              }
            >
              <View className="flex-row items-center gap-3 mb-3">
                <Avatar
                  name={item.barber.name}
                  size={44}
                  uri={item.barber.avatarUrl ?? undefined}
                />
                <View className="flex-1">
                  <Text className="text-[15px] font-semibold text-ink tracking-[-0.2px]">
                    {item.barber.name}
                  </Text>
                  {item.barber.shopName && (
                    <Text className="text-[12px] text-tertiary mt-[2px]">
                      {item.barber.shopName}
                    </Text>
                  )}
                </View>
                <StatusBadge status={item.status} />
              </View>

              <Text className="text-[13px] text-secondary mb-2" numberOfLines={1}>
                {serviceNames}
              </Text>

              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[13px] text-secondary">
                  {DAY_NAMES[item.dayOfWeek]} at {formatTime(item.timeOfDay)} ·{' '}
                  {FREQUENCY_LABELS[item.frequency] ?? item.frequency}
                </Text>
                <Text className="text-[14px] font-semibold text-ink">
                  {formatCurrency(item.priceUsd)}
                </Text>
              </View>
            </Pressable>

            <View className="flex-row gap-2 mt-1">
              <View className="flex-1">
                <Btn
                  label="Decline"
                  variant="danger"
                  full
                  onPress={() => handleReject(item.id)}
                  disabled={accept.isPending || reject.isPending}
                />
              </View>
              <View className="flex-1">
                <Btn
                  label="Accept"
                  variant="primary"
                  full
                  onPress={() => handleAccept(item.id)}
                  disabled={accept.isPending || reject.isPending}
                />
              </View>
            </View>
          </Card>
        </View>
      );
    },
    [router, accept.isPending, reject.isPending, handleAccept, handleReject],
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Pending Offers" onBack={() => router.back()} />
      </View>

      {arrangements.length === 0 ? (
        <EmptyState
          icon="repeat"
          title="No pending offers"
          subtitle="When a barber sends you a recurring arrangement offer, it will appear here for you to accept or decline."
        />
      ) : (
        <FlatList
          data={arrangements}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          contentContainerClassName="pb-8"
        />
      )}
    </SafeAreaView>
  );
}
