import { z } from 'zod';
import { apiClient } from './client';

// Canonical lifecycle states the API can return. Legacy aliases
// 'pending_payment' and 'failed' are kept so historic rows still parse;
// new code should treat them as 'processing' / 'payment_failed'.
export const NoShowStatus = z.enum([
  'unresolved',
  'payment_intent_created',
  'requires_action',
  'processing',
  'paid',
  'payment_failed',
  'canceled',
  'refunded',
  'reconciliation_required',
  // Legacy
  'pending_payment',
  'failed',
]);
export type NoShowStatus = z.infer<typeof NoShowStatus>;

export const IN_FLIGHT_NO_SHOW_STATUSES: NoShowStatus[] = [
  'payment_intent_created',
  'requires_action',
  'processing',
  'pending_payment',
];

export const TERMINAL_NO_SHOW_STATUSES: NoShowStatus[] = ['paid', 'refunded', 'canceled'];

export const OWING_NO_SHOW_STATUSES: NoShowStatus[] = [
  'unresolved',
  'payment_failed',
  'failed',
  'reconciliation_required',
];

const NoShowBookingSchema = z.object({
  id: z.string(),
  scheduledAt: z.string(),
  serviceName: z.string().nullable(),
});

const NoShowCounterpartySchema = z.object({
  id: z.string(),
  name: z.string(),
  profilePhotoUrl: z.string().nullable(),
});

const NoShowItemSchema = z.object({
  id: z.string(),
  status: NoShowStatus,
  amountUsd: z.number(),
  currency: z.string(),
  reason: z.string().nullable(),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
  booking: NoShowBookingSchema,
  counterparty: NoShowCounterpartySchema,
});

const PaginationSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
  limit: z.number(),
  hasNextPage: z.boolean(),
});

const NoShowsListResponseSchema = z.object({
  items: z.array(NoShowItemSchema),
  pagination: PaginationSchema,
});

const PayNoShowResponseSchema = z.object({
  noShowId: z.string(),
  paymentIntentId: z.string(),
  clientSecret: z.string(),
  status: NoShowStatus,
  stripePaymentIntentStatus: z.string().optional(),
  idempotencyKey: z.string().optional(),
  amountUsd: z.number(),
  currency: z.string(),
});

const ReconcileNoShowResponseSchema = z.object({
  noShowId: z.string(),
  status: NoShowStatus,
  stripePaymentIntentStatus: z.string().nullable(),
  changed: z.boolean(),
  reconciledAt: z.string(),
});

export type NoShowItem = z.infer<typeof NoShowItemSchema>;
export type NoShowsListResponse = z.infer<typeof NoShowsListResponseSchema>;
export type PayNoShowResponse = z.infer<typeof PayNoShowResponseSchema>;
export type ReconcileNoShowResponse = z.infer<typeof ReconcileNoShowResponseSchema>;

export interface ListNoShowsParams {
  status?: NoShowStatus;
  page?: number;
  limit?: number;
}

interface RequestOptions {
  signal?: AbortSignal;
}

export async function listClientNoShows(
  params: ListNoShowsParams = {},
  opts: RequestOptions = {},
): Promise<NoShowsListResponse> {
  const { data } = await apiClient.get('/client/no-shows', {
    params,
    signal: opts.signal,
  });
  return NoShowsListResponseSchema.parse(data);
}

export async function payNoShow(
  noShowId: string,
  opts: RequestOptions = {},
): Promise<PayNoShowResponse> {
  const { data } = await apiClient.post(
    `/client/no-shows/${noShowId}/pay`,
    {},
    { signal: opts.signal },
  );
  return PayNoShowResponseSchema.parse(data);
}

export async function reconcileNoShow(
  noShowId: string,
  opts: RequestOptions = {},
): Promise<ReconcileNoShowResponse> {
  const { data } = await apiClient.post(
    `/client/no-shows/${noShowId}/reconcile`,
    {},
    { signal: opts.signal },
  );
  return ReconcileNoShowResponseSchema.parse(data);
}
