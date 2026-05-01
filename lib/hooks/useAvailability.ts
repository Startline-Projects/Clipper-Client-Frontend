import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import * as availabilityApi from '@/lib/api/availability';

export function useAvailability(
  barberId: string | undefined,
  serviceIds: string[],
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: queryKeys.availability.forBarber(
      barberId!,
      serviceIds,
      startDate,
      endDate,
    ),
    queryFn: ({ signal }) =>
      availabilityApi.getAvailability(
        { barberId: barberId!, serviceIds, startDate, endDate },
        { signal },
      ),
    enabled: !!barberId && serviceIds.length > 0 && !!startDate && !!endDate,
    staleTime: 60_000,
  });
}
