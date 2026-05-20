import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type { RecurringBookingsFilters } from './queryKeys';
import { invalidations } from './invalidations';
import * as recurringApi from '@/lib/api/recurring';
import type {
  RecurringBooking,
  RecurringBookingDetail,
  CreateRecurringBody,
  PauseBody,
} from '@/lib/api/recurring';

// ── Services + Slots queries ──

export function useRecurringServices(barberId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.recurringServices.forBarber(barberId!),
    queryFn: ({ signal }) =>
      recurringApi.getRecurringServices(barberId!, { signal }),
    enabled: !!barberId,
    staleTime: 5 * 60_000,
  });
}

export function useRecurringSlots(
  barberId: string | undefined,
  serviceIds: string[],
  dayOfWeek: number | undefined,
  startDate?: string,
) {
  return useQuery({
    queryKey: queryKeys.recurringSlots.forBarber(
      barberId!,
      serviceIds,
      dayOfWeek!,
      startDate,
    ),
    queryFn: ({ signal }) =>
      recurringApi.getRecurringSlots(
        barberId!,
        { serviceIds, dayOfWeek: dayOfWeek!, startDate },
        { signal },
      ),
    enabled: !!barberId && serviceIds.length > 0 && dayOfWeek !== undefined,
    staleTime: 60_000,
  });
}

// ── List (cursor-based infinite) ──

export function useRecurringBookings(filters: RecurringBookingsFilters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.recurringBookings.list(filters),
    queryFn: ({ pageParam, signal }) =>
      recurringApi.listRecurringBookings(
        { status: filters.status, cursor: pageParam, limit: 10 },
        { signal },
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
  });
}

// ── Detail ──

export function useRecurringDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.recurringBookings.detail(id!),
    queryFn: ({ signal }) =>
      recurringApi.getRecurringBookingDetail(id!, { signal }),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });
}

// ── Create (non-optimistic) ──

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRecurringBody) =>
      recurringApi.createRecurringBooking(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.recurringBookings.all });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

// ── Pause (optimistic) ──

export function usePauseRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PauseBody }) =>
      recurringApi.pauseRecurringBooking(id, body),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({
        queryKey: queryKeys.recurringBookings.detail(id),
      });
      const previous = qc.getQueryData<RecurringBookingDetail>(
        queryKeys.recurringBookings.detail(id),
      );
      if (previous) {
        qc.setQueryData<RecurringBookingDetail>(
          queryKeys.recurringBookings.detail(id),
          { ...previous, status: 'paused' },
        );
      }
      return { previous, id };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(
          queryKeys.recurringBookings.detail(ctx.id),
          ctx.previous,
        );
      }
    },
    onSettled: (_data, _err, { id }) => invalidations.recurringMutated(qc, id),
  });
}

// ── Resume (optimistic) ──

export function useResumeRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recurringApi.resumeRecurringBooking(id),
    onMutate: async (id) => {
      await qc.cancelQueries({
        queryKey: queryKeys.recurringBookings.detail(id),
      });
      const previous = qc.getQueryData<RecurringBookingDetail>(
        queryKeys.recurringBookings.detail(id),
      );
      if (previous) {
        qc.setQueryData<RecurringBookingDetail>(
          queryKeys.recurringBookings.detail(id),
          { ...previous, status: 'active', pauseStartDate: null, pauseEndDate: null },
        );
      }
      return { previous, id };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(
          queryKeys.recurringBookings.detail(ctx.id),
          ctx.previous,
        );
      }
    },
    onSettled: (_data, _err, id) => invalidations.recurringMutated(qc, id),
  });
}

// ── Cancel (optimistic) ──

export function useCancelRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recurringApi.cancelRecurringBooking(id),
    onMutate: async (id) => {
      await qc.cancelQueries({
        queryKey: queryKeys.recurringBookings.detail(id),
      });
      const previous = qc.getQueryData<RecurringBookingDetail>(
        queryKeys.recurringBookings.detail(id),
      );
      if (previous) {
        qc.setQueryData<RecurringBookingDetail>(
          queryKeys.recurringBookings.detail(id),
          { ...previous, status: 'cancelled' },
        );
      }
      return { previous, id };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(
          queryKeys.recurringBookings.detail(ctx.id),
          ctx.previous,
        );
      }
    },
    onSettled: (_data, _err, id) => invalidations.recurringMutated(qc, id),
  });
}

// ── Renew (non-optimistic) ──

export function useRenewRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recurringApi.renewRecurringBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.recurringBookings.all });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}
