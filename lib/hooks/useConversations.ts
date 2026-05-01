import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type { ConversationsFilters } from './queryKeys';
import * as convoApi from '@/lib/api/conversations';

export function useConversations(filters: ConversationsFilters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.conversations.list(filters),
    queryFn: ({ pageParam, signal }) =>
      convoApi.listConversations(
        { page: pageParam, search: filters.search, limit: 20 },
        { signal },
      ),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasNextPage
        ? last.pagination.currentPage + 1
        : undefined,
  });
}
