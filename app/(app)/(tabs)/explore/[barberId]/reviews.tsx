import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Pill from '@/components/ui/Pill';
import ReviewsSummary from '@/components/explore/ReviewsSummary';
import ReviewCard from '@/components/explore/ReviewCard';
import EmptyState from '@/components/feedback/EmptyState';
import { SkeletonRow } from '@/components/feedback/Skeleton';
import { useBarberReviews } from '@/lib/hooks/useReviews';
import type { ReviewItem } from '@/lib/api/reviews';

const RATING_OPTIONS = [
  { label: 'All', value: undefined },
  { label: '5', value: 5 },
  { label: '4', value: 4 },
  { label: '3', value: 3 },
  { label: '2', value: 2 },
  { label: '1', value: 1 },
] as const;

export default function AllReviewsScreen() {
  const router = useRouter();
  const { barberId } = useLocalSearchParams<{ barberId: string }>();
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(
    undefined,
  );
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBarberReviews(barberId, { rating: ratingFilter });

  const pages = data?.pages ?? [];
  const reviews = pages.flatMap((p) => p.reviews);
  const barberMeta = pages[0]?.barber;

  const renderItem = useCallback(
    ({ item }: { item: ReviewItem }) => (
      <View className="px-5">
        <ReviewCard
          reviewerName={item.client.name}
          reviewerImage={item.client.profilePhotoUrl}
          rating={item.rating}
          comment={item.comment}
          createdAt={item.createdAt}
        />
      </View>
    ),
    [],
  );

  const ListHeader = useCallback(
    () => (
      <View className="px-5 mb-2">
        {barberMeta && (
          <ReviewsSummary
            averageRating={barberMeta.averageRating ?? 0}
            totalReviews={barberMeta.totalReviews}
          />
        )}
        <View className="flex-row gap-[7px] mb-[14px] flex-wrap">
          {RATING_OPTIONS.map((opt) => (
            <Pill
              key={opt.label}
              label={opt.value ? `${opt.value} ★` : 'All'}
              active={ratingFilter === opt.value}
              onPress={() => setRatingFilter(opt.value)}
            />
          ))}
        </View>
      </View>
    ),
    [barberMeta, ratingFilter],
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Reviews" onBack={() => router.back()} />
      </View>

      {isLoading ? (
        <View className="px-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      ) : reviews.length === 0 ? (
        <>
          <ListHeader />
          <EmptyState
            icon="star"
            title={ratingFilter ? `No ${ratingFilter}-star reviews` : 'No reviews yet'}
            body={
              ratingFilter
                ? 'Try a different rating filter'
                : 'Be the first to leave a review after your booking.'
            }
            cta={
              ratingFilter
                ? { label: 'Clear filter', onPress: () => setRatingFilter(undefined) }
                : undefined
            }
          />
        </>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
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
