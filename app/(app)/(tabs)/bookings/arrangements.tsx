import { useCallback } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/feedback/EmptyState';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import { useArrangements } from '@/lib/hooks/useArrangements';
import { formatCurrency, formatTime } from '@/lib/utils/format';
import type { Arrangement } from '@/lib/api/arrangements';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  every_n_weeks: 'Custom',
  monthly: 'Monthly',
};

export default function ArrangementsScreen() {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useArrangements();
  const arrangements = data?.pages.flatMap((p) => p.arrangements) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: Arrangement }) => {
      const isPending = item.status === 'pending_client_approval';
      const serviceNames = item.services.map((s) => s.name).join(', ');

      return (
        <View className="px-5">
          <Card
            className={`p-4 ${isPending ? 'border-yellow/30' : ''}`}
            onPress={() =>
              router.push(
                `/(app)/(tabs)/bookings/arrangements/${item.id}`,
              )
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

            <Text
              className="text-[13px] text-secondary mb-2"
              numberOfLines={1}
            >
              {serviceNames}
            </Text>

            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] text-secondary">
                {DAY_NAMES[item.dayOfWeek]} at {formatTime(item.timeOfDay)} ·{' '}
                {FREQUENCY_LABELS[item.frequency] ?? item.frequency}
              </Text>
              <Text className="text-[14px] font-semibold text-ink">
                {formatCurrency(item.priceUsd)}
              </Text>
            </View>
          </Card>
        </View>
      );
    },
    [router],
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header
          title="Arrangements"
          onBack={() => router.back()}
          right={
            <Pressable
              onPress={() =>
                router.push('/(app)/(tabs)/bookings/arrangements/pending')
              }
              className="active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="View pending offers"
            >
              <Text className="text-[14px] font-medium text-brand">
                Pending
              </Text>
            </Pressable>
          }
        />
      </View>

      {arrangements.length === 0 ? (
        <EmptyState
          icon="repeat"
          title="No arrangements"
          subtitle="When a barber offers you a recurring arrangement, it will appear here."
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
