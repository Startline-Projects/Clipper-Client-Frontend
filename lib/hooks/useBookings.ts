import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { invalidations } from './invalidations';
import * as bookingsApi from '@/lib/api/bookings';
import type { BookingDetail } from '@/lib/api/bookings';

// ── Upcoming (page-based infinite) ──

export function useUpcomingBookings() {
  return useInfiniteQuery({
    queryKey: queryKeys.bookings.upcoming.lists(),
    queryFn: ({ pageParam, signal }) =>
      bookingsApi.listUpcomingBookings({ page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasNextPage
        ? last.pagination.currentPage + 1
        : undefined,
  });
}

// ── Past (page-based infinite) ──

export function usePastBookings() {
  return useInfiniteQuery({
    queryKey: queryKeys.bookings.past.lists(),
    queryFn: ({ pageParam, signal }) =>
      bookingsApi.listPastBookings({ page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasNextPage
        ? last.pagination.currentPage + 1
        : undefined,
  });
}

// ── Recurring collapsed list (page-based infinite) ──

export function useRecurringBookingsList() {
  return useInfiniteQuery({
    queryKey: queryKeys.bookings.recurring.lists(),
    queryFn: ({ pageParam, signal }) =>
      bookingsApi.listRecurringBookings({ page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasNextPage
        ? last.pagination.currentPage + 1
        : undefined,
  });
}

// ── Detail ──

export function useBookingDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id!),
    queryFn: ({ signal }) => bookingsApi.getBookingDetail(id!, { signal }),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });
}

// ── Cancel (optimistic) ──

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancelBooking(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.bookings.detail(id) });
      const previous = qc.getQueryData<BookingDetail>(
        queryKeys.bookings.detail(id),
      );
      if (previous) {
        qc.setQueryData<BookingDetail>(queryKeys.bookings.detail(id), {
          ...previous,
          status: 'cancelled',
          cancelledBy: 'client',
        });
      }
      return { previous, id };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(queryKeys.bookings.detail(ctx.id), ctx.previous);
      }
    },
    onSettled: (_data, _err, id) => invalidations.bookingMutated(qc, id),
  });
}
