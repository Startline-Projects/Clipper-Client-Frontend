import { z } from 'zod';
import { SubscriptionStatus, SubscriptionPlan } from '@/lib/schemas/enums';
import { apiClient } from './client';

// ── Response schemas ──

const CreateSubscriptionResponseSchema = z.object({
  subscriptionId: z.string(),
  status: SubscriptionStatus,
  clientSecret: z.string().nullable(),
});

const SubscriptionStateSchema = z.object({
  status: SubscriptionStatus,
  plan: SubscriptionPlan.nullable(),
  currentPeriodEnd: z.string().nullable(),
  cancelAtPeriodEnd: z.boolean(),
});

const ActivePlanResponseSchema = z.object({
  hasActivePlan: z.boolean(),
  plan: z.enum(['monthly', 'yearly']).nullable(),
  status: z.enum(['inactive', 'active', 'past_due', 'cancelled']),
  currentPeriodEnd: z.string().nullable(),
  cancelAtPeriodEnd: z.boolean(),
});

const CancelSubscriptionResponseSchema = z.object({
  status: z.literal('active'),
  cancelAtPeriodEnd: z.literal(true),
  currentPeriodEnd: z.string().nullable(),
});

const CardActionResponseSchema = z.object({
  ok: z.boolean(),
  paymentMethodId: z.string().nullable(),
});

// ── Public types ──

export type CreateSubscriptionResponse = z.infer<typeof CreateSubscriptionResponseSchema>;
export type SubscriptionState = z.infer<typeof SubscriptionStateSchema>;
export type ActivePlanResponse = z.infer<typeof ActivePlanResponseSchema>;
export type CancelSubscriptionResponse = z.infer<typeof CancelSubscriptionResponseSchema>;
export type CardActionResponse = z.infer<typeof CardActionResponseSchema>;

export interface CreateSubscriptionBody {
  plan: 'monthly' | 'yearly';
  paymentMethodId: string;
}

interface RequestOptions {
  signal?: AbortSignal;
}

// ── Endpoints ──

export async function createSubscription(
  body: CreateSubscriptionBody,
  opts: RequestOptions = {},
): Promise<CreateSubscriptionResponse> {
  const { data } = await apiClient.post('/subscriptions', body, {
    signal: opts.signal,
  });
  return CreateSubscriptionResponseSchema.parse(data);
}

export async function getSubscription(
  opts: RequestOptions = {},
): Promise<SubscriptionState> {
  const { data } = await apiClient.get('/subscriptions/me', {
    signal: opts.signal,
  });
  return SubscriptionStateSchema.parse(data);
}

export async function getActivePlan(
  opts: RequestOptions = {},
): Promise<ActivePlanResponse> {
  const { data } = await apiClient.get('/subscriptions/me/active-plan', {
    signal: opts.signal,
  });
  return ActivePlanResponseSchema.parse(data);
}

export async function switchPlan(
  body: { plan: 'yearly' },
  opts: RequestOptions = {},
): Promise<SubscriptionState> {
  const { data } = await apiClient.patch('/subscriptions/me/plan', body, {
    signal: opts.signal,
  });
  return SubscriptionStateSchema.parse(data);
}

export async function cancelSubscription(
  opts: RequestOptions = {},
): Promise<CancelSubscriptionResponse> {
  const { data } = await apiClient.delete('/subscriptions/me', {
    signal: opts.signal,
  });
  return CancelSubscriptionResponseSchema.parse(data);
}

export async function replacePaymentMethod(
  body: { paymentMethodId: string },
  opts: RequestOptions = {},
): Promise<CardActionResponse> {
  const { data } = await apiClient.post(
    '/subscriptions/me/payment-method',
    body,
    { signal: opts.signal },
  );
  return CardActionResponseSchema.parse(data);
}

export async function reactivateSubscription(
  opts: RequestOptions = {},
): Promise<SubscriptionState> {
  const { data } = await apiClient.post(
    '/subscriptions/me/reactivate',
    undefined,
    { signal: opts.signal },
  );
  return SubscriptionStateSchema.parse(data);
}

export async function removePaymentMethod(
  opts: RequestOptions = {},
): Promise<CardActionResponse> {
  const { data } = await apiClient.delete('/subscriptions/me/payment-method', {
    signal: opts.signal,
  });
  return CardActionResponseSchema.parse(data);
}
