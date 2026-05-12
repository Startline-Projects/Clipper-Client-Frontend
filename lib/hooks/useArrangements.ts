import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type { ArrangementsFilters } from './queryKeys';
import { invalidations } from './invalidations';
import * as arrangementsApi from '@/lib/api/arrangements';
import type { RejectBody } from '@/lib/api/arrangements';

// ── List (cursor-based infinite) ──

export function useArrangements(filters: ArrangementsFilters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.arrangements.list(filters),
    queryFn: ({ pageParam, signal }) =>
      arrangementsApi.listArrangements(
        { status: filters.status, cursor: pageParam, limit: 10 },
        { signal },
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
  });
}

export function usePendingArrangements() {
  return useInfiniteQuery({
    queryKey: queryKeys.arrangements.pending(),
    queryFn: ({ pageParam, signal }) =>
      arrangementsApi.listPendingArrangements(
        { cursor: pageParam, limit: 20 },
        { signal },
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
  });
}

// ── Detail ──

export function useArrangementDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.arrangements.detail(id!),
    queryFn: ({ signal }) =>
      arrangementsApi.getArrangementDetail(id!, { signal }),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });
}

// ── Accept ──

export function useAcceptArrangement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => arrangementsApi.acceptArrangement(id),
    onSuccess: (_data, id) => invalidations.arrangementMutated(qc, id),
  });
}

// ── Reject ──

export function useRejectArrangement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: RejectBody }) =>
      arrangementsApi.rejectArrangement(id, body),
    onSuccess: (_data, { id }) => invalidations.arrangementMutated(qc, id),
  });
}
