import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type { BarbersFilters } from './queryKeys';
import * as barbersApi from '@/lib/api/barbers';

export function useBarbers(filters: BarbersFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.barbers.list(filters),
    queryFn: ({ pageParam, signal }) =>
      barbersApi.listBarbers(
        {
          latitude: filters.latitude,
          longitude: filters.longitude,
          sort: filters.sort,
          search: filters.search,
          recurring: filters.recurring,
          page: pageParam,
        },
        { signal },
      ),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasNextPage
        ? last.pagination.currentPage + 1
        : undefined,
  });
}

export function useBarberDetail(
  barberId: string | undefined,
  coords: { latitude: number; longitude: number } | null,
) {
  return useQuery({
    queryKey: queryKeys.barbers.detail(barberId!),
    queryFn: ({ signal }) =>
      barbersApi.getBarberDetail(barberId!, coords!, { signal }),
    enabled: !!barberId && !!coords,
    staleTime: 2 * 60_000,
  });
}
