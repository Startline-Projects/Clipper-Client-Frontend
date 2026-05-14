import { useCallback, useRef } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type BottomSheet from '@gorhom/bottom-sheet';
import SearchInput from '@/components/forms/SearchInput';
import Pill from '@/components/ui/Pill';
import Icon from '@/components/ui/Icon';
import BarberCard from '@/components/explore/BarberCard';
import CategoryFilterSheet from '@/components/explore/CategoryFilterSheet';
import EmptyState from '@/components/feedback/EmptyState';
import ErrorView from '@/components/feedback/ErrorView';
import { BarberCardSkeleton } from '@/components/feedback/SkeletonVariants';
import { useBarbers } from '@/lib/hooks/useBarbers';
import { useLocation } from '@/lib/hooks/useLocation';
import { useUnreadCount } from '@/lib/hooks/useNotifications';
import {
  useFiltersStore,
  useExploreSort,
  useExploreSearch,
  useExploreRecurringFilter,
  useExploreCategories,
} from '@/lib/stores/filters';
import { useColors } from '@/lib/theme/colors';
import { categoryLabel } from '@/lib/utils/categories';
import type { BarberListItem } from '@/lib/api/barbers';

export default function ExploreScreen() {
  const router = useRouter();
  const colors = useColors();
  const { latitude, longitude, loading: locLoading, error: locError, refresh: refreshLocation } = useLocation();
  const sort = useExploreSort();
  const search = useExploreSearch();
  const recurringFilter = useExploreRecurringFilter();
  const categories = useExploreCategories();
  const setSort = useFiltersStore((s) => s.setExploreSort);
  const setSearch = useFiltersStore((s) => s.setExploreSearch);
  const setRecurringFilter = useFiltersStore((s) => s.setExploreRecurringFilter);
  const setCategories = useFiltersStore((s) => s.setExploreCategories);
  const { data: unreadCount } = useUnreadCount();

  const filterSheetRef = useRef<BottomSheet>(null);

  const hasCoords = latitude !== null && longitude !== null;
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBarbers({
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      sort: sort || undefined,
      search: search || undefined,
      recurring: recurringFilter || undefined,
      categories: categories.length > 0 ? categories : undefined,
    });

  const barbers = data?.pages.flatMap((p) => p.barbers) ?? [];
  const hasUnread = typeof unreadCount === 'number' && unreadCount > 0;
  const hasActiveFilters =
    !!search || !!recurringFilter || categories.length > 0;

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
          categories={item.categories}
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
            <Text className="text-[28px] font-bold text-ink tracking-[-0.6px] mt-[2px]">
              Explore
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(app)/(tabs)/explore/notifications')}
            className="w-9 h-9 rounded-full bg-bg-warm items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={`Notifications${hasUnread ? ', unread' : ''}`}
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
            label="Recurring"
            active={recurringFilter === 'available'}
            color={colors.badgeRecurring}
            onPress={() =>
              setRecurringFilter(
                recurringFilter === 'available' ? null : 'available',
              )
            }
          />
          <Pressable
            onPress={() => filterSheetRef.current?.expand()}
            style={{
              backgroundColor:
                categories.length > 0 ? colors.brand : colors.bg,
            }}
            className="flex-row items-center gap-[5px] self-start rounded-full px-3 py-2 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel={
              categories.length > 0
                ? `Specialties filter, ${categories.length} selected`
                : 'Filter by specialties'
            }
          >
            <Icon
              name="filter"
              size={13}
              color={categories.length > 0 ? colors.white : colors.secondary}
            />
            <Text
              style={{
                color: categories.length > 0 ? colors.white : colors.secondary,
              }}
              className="text-[13px] font-semibold tracking-[-0.1px]"
            >
              {categories.length > 0
                ? `Specialties · ${categories.length}`
                : 'Specialties'}
            </Text>
          </Pressable>
        </View>

        {categories.length > 0 && (
          <View className="flex-row flex-wrap gap-[6px] mb-[14px]">
            {categories.map((tag) => (
              <Pressable
                key={tag}
                onPress={() =>
                  setCategories(categories.filter((c) => c !== tag))
                }
                style={{ backgroundColor: colors.brandPale }}
                className="flex-row items-center gap-[5px] rounded-full px-[10px] py-[5px] active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel={`Remove ${categoryLabel(tag)} filter`}
              >
                <Text
                  style={{ color: colors.brand }}
                  className="text-[12px] font-semibold tracking-[-0.1px]"
                >
                  {categoryLabel(tag)}
                </Text>
                <Icon name="x" size={11} color={colors.brand} />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {locLoading ? (
        <View className="px-5">
          {[1, 2, 3].map((i) => (
            <BarberCardSkeleton key={i} />
          ))}
        </View>
      ) : locError || !hasCoords ? (
        <ErrorView
          title="Location required"
          message="Enable location to discover barbers near you."
          icon="location"
          onRetry={refreshLocation}
        />
      ) : isLoading ? (
        <View className="px-5">
          {[1, 2, 3].map((i) => (
            <BarberCardSkeleton key={i} />
          ))}
        </View>
      ) : barbers.length === 0 ? (
        <EmptyState
          icon="search"
          title="No barbers found"
          body="Try a different search or adjust your filters."
          cta={
            hasActiveFilters
              ? {
                  label: 'Clear filters',
                  onPress: () => {
                    setSearch('');
                    setRecurringFilter(null);
                    setCategories([]);
                  },
                }
              : undefined
          }
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
          contentContainerClassName="pb-8"
        />
      )}

      <CategoryFilterSheet
        ref={filterSheetRef}
        selected={categories}
        onApply={(next) => {
          setCategories(next);
          filterSheetRef.current?.close();
        }}
        onClose={() => {}}
      />
    </SafeAreaView>
  );
}
