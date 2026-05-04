import { useCallback } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchInput from '@/components/forms/SearchInput';
import Pill from '@/components/ui/Pill';
import Icon from '@/components/ui/Icon';
import BarberCard from '@/components/explore/BarberCard';
import EmptyState from '@/components/feedback/EmptyState';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import { useBarbers } from '@/lib/hooks/useBarbers';
import { useLocation } from '@/lib/hooks/useLocation';
import { useUnreadCount } from '@/lib/hooks/useNotifications';
import {
  useFiltersStore,
  useExploreSort,
  useExploreSearch,
  useExploreRecurringFilter,
} from '@/lib/stores/filters';
import { useColors } from '@/lib/theme/colors';
import type { BarberListItem } from '@/lib/api/barbers';

export default function ExploreScreen() {
  const router = useRouter();
  const colors = useColors();
  const { latitude, longitude, loading: locLoading, error: locError, refresh: refreshLocation } = useLocation();
  const sort = useExploreSort();
  const search = useExploreSearch();
  const recurringFilter = useExploreRecurringFilter();
  const setSort = useFiltersStore((s) => s.setExploreSort);
  const setSearch = useFiltersStore((s) => s.setExploreSearch);
  const setRecurringFilter = useFiltersStore((s) => s.setExploreRecurringFilter);
  const { data: unreadCount } = useUnreadCount();

  const hasCoords = latitude !== null && longitude !== null;
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBarbers({
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      sort: sort || undefined,
      search: search || undefined,
      recurring: recurringFilter || undefined,
    });

  const barbers = data?.pages.flatMap((p) => p.barbers) ?? [];
  const hasUnread = typeof unreadCount === 'number' && unreadCount > 0;

  const renderItem = useCallback(
    ({ item }: { item: BarberListItem }) => (
      <View className="px-5">
        <BarberCard
          name={item.name}
          profileImage={item.profileImage}
          averageRating={item.averageRating}
          totalReviews={item.totalReviews}
          distance={item.distance}
          recurringAvailable={item.recurringAvailable}
          topServices={item.topServices}
          onPress={() => router.push(`/(app)/(tabs)/explore/${item.id}`)}
        />
      </View>
    ),
    [router],
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5 pt-2 pb-0">
        <View className="flex-row items-center justify-between mb-[18px]">
          <View>
            <Text className="text-[14px] text-secondary tracking-[-0.1px]">
              Find your barber
            </Text>
            <Text className="text-[26px] font-bold text-ink tracking-[-0.6px] mt-[2px]">
              Explore
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(app)/(tabs)/home/notifications')}
            className="w-10 h-10 rounded-full bg-bg-warm items-center justify-center"
          >
            <Icon name="bell" size={19} color={colors.ink} />
            {hasUnread && (
              <View className="absolute top-[8px] right-[8px] w-2 h-2 rounded-full bg-red" />
            )}
          </Pressable>
        </View>

        <View className="flex-row gap-[10px] mb-[14px]">
          <View className="flex-1">
            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search barbers, services…"
            />
          </View>
        </View>

        <View className="flex-row gap-[7px] mb-[14px]">
          <Pill
            label="Nearest"
            active={sort === 'nearest'}
            onPress={() => setSort('nearest')}
          />
          <Pill
            label="Top rated"
            active={sort === 'top_rated'}
            onPress={() => setSort('top_rated')}
          />
          <Pill
            label="Recurring available"
            active={recurringFilter === 'available'}
            color="#C47F17"
            onPress={() =>
              setRecurringFilter(
                recurringFilter === 'available' ? null : 'available',
              )
            }
          />
        </View>
      </View>

      {locLoading ? (
        <LoadingSpinner />
      ) : locError || !hasCoords ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-14 h-14 rounded-full bg-bg-warm items-center justify-center mb-4">
            <Icon name="location" size={26} color={colors.tertiary} />
          </View>
          <Text className="text-[16px] font-semibold text-ink text-center mb-1">
            Location required
          </Text>
          <Text className="text-[14px] text-tertiary text-center leading-[20px] mb-4">
            Enable location to discover barbers near you.
          </Text>
          <Pressable onPress={refreshLocation} className="active:opacity-70">
            <Text className="text-[14px] font-semibold text-blue">
              Try again
            </Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <LoadingSpinner />
      ) : barbers.length === 0 ? (
        <EmptyState
          icon="scissors"
          title="No barbers found"
          subtitle="Try a different search or adjust your filters."
        />
      ) : (
        <FlatList
          data={barbers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          contentContainerClassName="pb-6"
        />
      )}
    </SafeAreaView>
  );
}
