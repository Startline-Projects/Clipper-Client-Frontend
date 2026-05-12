import { z } from 'zod';
import { apiClient } from './client';

export const NoShowStatus = z.enum([
  'unresolved',
  'pending_payment',
  'paid',
  'failed',
  'refunded',
]);
export type NoShowStatus = z.infer<typeof NoShowStatus>;

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
  amountUsd: z.number(),
  currency: z.string(),
});

export type NoShowItem = z.infer<typeof NoShowItemSchema>;
export type NoShowsListResponse = z.infer<typeof NoShowsListResponseSchema>;
export type PayNoShowResponse = z.infer<typeof PayNoShowResponseSchema>;

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
