import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth.store';
import { queryKeys } from './queryKeys';
import { invalidations } from './invalidations';
import * as noShowsApi from '@/lib/api/no-shows';
import type { NoShowStatus } from '@/lib/api/no-shows';

export function useClientNoShows(status?: NoShowStatus) {
  const hasTokens = useAuthStore((s) => Boolean(s.accessToken));
  return useQuery({
    queryKey: queryKeys.noShows.list(status),
    queryFn: ({ signal }) =>
      noShowsApi.listClientNoShows({ status, limit: 50 }, { signal }),
    enabled: hasTokens,
    staleTime: 30_000,
  });
}

export function usePayNoShow() {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: (noShowId: string) => noShowsApi.payNoShow(noShowId),
    onSuccess: () => invalidations.noShowResolved(qc),
  });
}
