import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth.store';
import { supabase } from '@/lib/utils/supabase-client';
import { queryKeys } from './queryKeys';
import { invalidations } from './invalidations';
import * as noShowsApi from '@/lib/api/no-shows';
import {
  IN_FLIGHT_NO_SHOW_STATUSES,
  TERMINAL_NO_SHOW_STATUSES,
  type NoShowStatus,
} from '@/lib/api/no-shows';

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

// On-demand authoritative reconcile against Stripe. Used as a backstop
// when the webhook hasn't landed within the polling window.
export function useReconcileNoShow() {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: (noShowId: string) => noShowsApi.reconcileNoShow(noShowId),
    onSuccess: () => invalidations.noShowResolved(qc),
  });
}

// Subscribes to no_shows row UPDATEs for the signed-in client. RLS
// already restricts visibility to the client's own rows, but we
// additionally filter on client_id for narrower channel routing.
//
// Triggers a list refetch on any change so the React Query cache stays
// in sync with the row state Stripe webhooks are writing.
export function useRealtimeNoShows() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? null);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`no_shows:client:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'no_shows',
          filter: `client_id=eq.${userId}`,
        },
        () => {
          invalidations.noShowResolved(qc);
        }
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [userId, qc]);
}

// Re-export status sets so screens can branch on lifecycle without
// re-importing from the api module.
export { IN_FLIGHT_NO_SHOW_STATUSES, TERMINAL_NO_SHOW_STATUSES };
