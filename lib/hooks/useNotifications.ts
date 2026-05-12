import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth.store';
import { queryKeys } from './queryKeys';
import { invalidations } from './invalidations';
import * as notifApi from '@/lib/api/notifications';
import type { NotificationsListResponse } from '@/lib/api/notifications';

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.lists(),
    queryFn: ({ pageParam, signal }) =>
      notifApi.listNotifications({ page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasNextPage
        ? last.pagination.currentPage + 1
        : undefined,
  });
}

export function useUnreadCount() {
  const hasTokens = useAuthStore((s) => Boolean(s.accessToken));
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: ({ signal }) => notifApi.getUnreadCount({ signal }),
    enabled: hasTokens,
    staleTime: 120_000,
    refetchInterval: 300_000,
  });
}

export function useClearAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notifApi.clearAllNotifications(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.lists() });
      await qc.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });

      const previousList =
        qc.getQueryData<InfiniteData<NotificationsListResponse>>(
          queryKeys.notifications.lists(),
        );
      const previousCount = qc.getQueryData<number>(
        queryKeys.notifications.unreadCount(),
      );

      qc.setQueryData<InfiniteData<NotificationsListResponse>>(
        queryKeys.notifications.lists(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: [{ notifications: [], pagination: { currentPage: 1, totalPages: 1, totalNotifications: 0, limit: 20, hasNextPage: false } }],
            pageParams: [1],
          };
        },
      );
      qc.setQueryData<number>(queryKeys.notifications.unreadCount(), 0);

      return { previousList, previousCount };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousList) {
        qc.setQueryData(queryKeys.notifications.lists(), ctx.previousList);
      }
      if (ctx?.previousCount !== undefined) {
        qc.setQueryData(queryKeys.notifications.unreadCount(), ctx.previousCount);
      }
    },
    onSettled: () => invalidations.notificationRead(qc),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notifApi.markNotificationRead(notificationId),
    onMutate: async (notificationId) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.lists() });
      await qc.cancelQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });

      const previousList =
        qc.getQueryData<InfiniteData<NotificationsListResponse>>(
          queryKeys.notifications.lists(),
        );
      const previousCount = qc.getQueryData<number>(
        queryKeys.notifications.unreadCount(),
      );

      qc.setQueryData<InfiniteData<NotificationsListResponse>>(
        queryKeys.notifications.lists(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              notifications: page.notifications.map((n) =>
                n.id === notificationId ? { ...n, isRead: true } : n,
              ),
            })),
          };
        },
      );

      if (typeof previousCount === 'number' && previousCount > 0) {
        qc.setQueryData<number>(
          queryKeys.notifications.unreadCount(),
          previousCount - 1,
        );
      }

      return { previousList, previousCount };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previousList) {
        qc.setQueryData(queryKeys.notifications.lists(), ctx.previousList);
      }
      if (ctx?.previousCount !== undefined) {
        qc.setQueryData(
          queryKeys.notifications.unreadCount(),
          ctx.previousCount,
        );
      }
    },
    onSettled: () => invalidations.notificationRead(qc),
  });
}
