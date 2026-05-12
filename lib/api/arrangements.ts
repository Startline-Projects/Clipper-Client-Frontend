import { z } from 'zod';
import {
  RecurringArrangementStatus,
  ArrangementFrequency,
  ArrangementEndType,
  BookingType,
} from '@/lib/schemas/enums';
import { apiClient } from './client';

// ── Arrangement service ──

const ArrangementServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationMinutes: z.number(),
  bookingType: BookingType,
  priceUsd: z.number(),
  sortOrder: z.number(),
});

// ── Arrangement ──

const ArrangementSchema = z.object({
  id: z.string(),
  status: RecurringArrangementStatus,
  dayOfWeek: z.number().min(0).max(6),
  timeOfDay: z.string(),
  frequency: ArrangementFrequency,
  intervalN: z.number().nullable(),
  startDate: z.string(),
  endType: ArrangementEndType,
  endCount: z.number().nullable(),
  endDate: z.string().nullable(),
  noteToClient: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  respondedAt: z.string().nullable(),
  priceUsd: z.number(),
  totalDurationMinutes: z.number(),
  barber: z.object({
    id: z.string(),
    name: z.string(),
    shopName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
  client: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  services: z.array(ArrangementServiceSchema),
  nextOccurrences: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  noChange: z.boolean(),
});

const ArrangementResponseSchema = z.object({
  arrangement: ArrangementSchema,
});

// ── List (cursor) ──

const ArrangementsListSchema = z.object({
  arrangements: z.array(ArrangementSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

// ── Public types ──

export type ArrangementService = z.infer<typeof ArrangementServiceSchema>;
export type Arrangement = z.infer<typeof ArrangementSchema>;
export type ArrangementsList = z.infer<typeof ArrangementsListSchema>;

export interface RejectBody {
  reason?: string;
}

interface ListParams {
  status?: string;
  cursor?: string;
  limit?: number;
}

interface RequestOptions {
  signal?: AbortSignal;
}

// ── Endpoints ──

export async function listArrangements(
  params: ListParams = {},
  opts: RequestOptions = {},
): Promise<ArrangementsList> {
  const { data } = await apiClient.get('/client/recurring-arrangements', {
    params,
    signal: opts.signal,
  });
  return ArrangementsListSchema.parse(data);
}

export async function listPendingArrangements(
  params: { cursor?: string; limit?: number } = {},
  opts: RequestOptions = {},
): Promise<ArrangementsList> {
  const { data } = await apiClient.get(
    '/client/recurring-arrangements/pending',
    { params, signal: opts.signal },
  );
  return ArrangementsListSchema.parse(data);
}

export async function getArrangementDetail(
  id: string,
  opts: RequestOptions = {},
): Promise<Arrangement> {
  const { data } = await apiClient.get(
    `/client/recurring-arrangements/${id}`,
    { signal: opts.signal },
  );
  return ArrangementResponseSchema.parse(data).arrangement;
}

export async function acceptArrangement(
  id: string,
  opts: RequestOptions = {},
): Promise<Arrangement> {
  const { data } = await apiClient.post(
    `/client/recurring-arrangements/${id}/accept`,
    undefined,
    { signal: opts.signal },
  );
  return ArrangementResponseSchema.parse(data).arrangement;
}

export async function rejectArrangement(
  id: string,
  body: RejectBody = {},
  opts: RequestOptions = {},
): Promise<Arrangement> {
  const { data } = await apiClient.post(
    `/client/recurring-arrangements/${id}/reject`,
    body,
    { signal: opts.signal },
  );
  return ArrangementResponseSchema.parse(data).arrangement;
}
