import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth.store';
import { queryKeys } from './queryKeys';
import { invalidations } from './invalidations';
import * as subApi from '@/lib/api/subscriptions';
import type { SubscriptionState } from '@/lib/api/subscriptions';

export function useSubscription() {
  const hasTokens = useAuthStore((s) => Boolean(s.accessToken));
  return useQuery({
    queryKey: queryKeys.subscription.me(),
    queryFn: ({ signal }) => subApi.getSubscription({ signal }),
    enabled: hasTokens,
    staleTime: 2 * 60_000,
  });
}

export function useCreateSubscription() {
  return useMutation({
    meta: { silent: true },
    mutationFn: (body: subApi.CreateSubscriptionBody) =>
      subApi.createSubscription(body),
  });
}

export function useSwitchPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => subApi.switchPlan({ plan: 'yearly' }),
    onSuccess: () => invalidations.subscriptionChanged(qc),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => subApi.cancelSubscription(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.subscription.me() });
      const previous = qc.getQueryData<SubscriptionState>(
        queryKeys.subscription.me(),
      );
      if (previous) {
        qc.setQueryData<SubscriptionState>(queryKeys.subscription.me(), {
          ...previous,
          cancelAtPeriodEnd: true,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(queryKeys.subscription.me(), ctx.previous);
      }
    },
    onSettled: () => invalidations.subscriptionChanged(qc),
  });
}

export function useReplacePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { paymentMethodId: string }) =>
      subApi.replacePaymentMethod(body),
    onSuccess: () => invalidations.subscriptionChanged(qc),
  });
}

export function useRemovePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => subApi.removePaymentMethod(),
    onSuccess: () => invalidations.subscriptionChanged(qc),
  });
}
