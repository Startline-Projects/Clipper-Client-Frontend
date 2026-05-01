import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type { ReviewsFilters } from './queryKeys';
import { invalidations } from './invalidations';
import * as reviewsApi from '@/lib/api/reviews';
import type { CreateReviewBody } from '@/lib/api/reviews';

export function useBarberReviews(
  barberId: string | undefined,
  filters: ReviewsFilters = {},
) {
  return useInfiniteQuery({
    queryKey: queryKeys.reviews.forBarber(barberId!, filters),
    queryFn: ({ pageParam, signal }) =>
      reviewsApi.listBarberReviews(
        barberId!,
        { cursor: pageParam, rating: filters.rating, limit: 10 },
        { signal },
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
    enabled: !!barberId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      body,
    }: {
      bookingId: string;
      body: CreateReviewBody;
    }) => reviewsApi.createReview(bookingId, body),
    onSuccess: (_data, { bookingId }) =>
      invalidations.reviewCreated(qc, bookingId),
  });
}
