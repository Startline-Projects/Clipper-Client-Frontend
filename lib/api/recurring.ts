import { z } from 'zod';
import {
  ServiceType,
  BookingType,
  BookingStatus,
  RecurringFrequency,
  RecurringStatus,
  CancelledBy,
} from '@/lib/schemas/enums';
import { apiClient } from './client';

// ── Recurring services ──

const RecurringServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  serviceType: ServiceType,
  durationMinutes: z.number(),
  regularPrice: z.number(),
  recurringPriceFrom: z.number(),
});

const RecurringServicesResponseSchema = z.object({
  services: z.array(RecurringServiceSchema),
});

// ── Recurring slots ──

const RecurringSlotSchema = z.object({
  time: z.string(),
  available: z.boolean(),
});

const RecurringSlotsResponseSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  recurringAvailable: z.boolean(),
  recurringFrequencyOptions: z.array(RecurringFrequency),
  recurringPriceUsd: z.number().nullable(),
  totalDurationMinutes: z.number(),
  slots: z.array(RecurringSlotSchema),
});

// ── Recurring booking ──

const RecurringBookingServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationMinutes: z.number(),
  bookingType: BookingType,
  startOffsetMinutes: z.number(),
  priceUsd: z.number(),
});

const RecurringBookingSchema = z.object({
  id: z.string(),
  status: RecurringStatus,
  isRenewal: z.boolean(),
  dayOfWeek: z.number().min(0).max(6),
  slotTime: z.string(),
  frequency: RecurringFrequency,
  priceUsd: z.number(),
  service: z.object({
    id: z.string(),
    name: z.string(),
    durationMinutes: z.number(),
  }),
  barber: z.object({ id: z.string(), name: z.string() }),
  client: z.object({ id: z.string(), name: z.string() }),
  nextOccurrenceAt: z.string().nullish(),
  createdAt: z.string(),
});

const RecurringBookingResponseSchema = z.object({
  recurringBooking: RecurringBookingSchema,
});

// ── List (cursor) ──

const RecurringBookingsListSchema = z.object({
  recurringBookings: z.array(RecurringBookingSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

// ── Detail ──

const OccurrenceSchema = z.object({
  bookingId: z.string(),
  scheduledAt: z.string(),
  status: BookingStatus,
});

const RecurringBookingDetailSchema = z.object({
  recurringBooking: z.object({
    id: z.string(),
    status: RecurringStatus,
    isRenewal: z.boolean(),
    originalRecurringBookingId: z.string().nullable(),
    dayOfWeek: z.number().min(0).max(6),
    slotTime: z.string(),
    frequency: RecurringFrequency,
    priceUsd: z.number(),
    pauseStartDate: z.string().nullable(),
    pauseEndDate: z.string().nullable(),
    windowStartDate: z.string().nullable(),
    service: z.object({
      id: z.string(),
      name: z.string(),
      durationMinutes: z.number(),
    }),
    services: z.array(RecurringBookingServiceSchema),
    totalDurationMinutes: z.number(),
    barber: z.object({ id: z.string(), name: z.string() }),
    barberProfilePhotoUrl: z.string().nullable().optional(),
    client: z.object({ id: z.string(), name: z.string() }),
    createdAt: z.string(),
    barberAcceptedAt: z.string().nullable(),
    barberDeclinedAt: z.string().nullable(),
    declinedReason: z.string().nullable(),
    cancelledAt: z.string().nullable(),
    cancelledBy: CancelledBy.nullable(),
    pastOccurrences: z.array(OccurrenceSchema),
    upcomingOccurrences: z.array(OccurrenceSchema),
  }),
});

// ── Public types ──

export type RecurringService = z.infer<typeof RecurringServiceSchema>;
export type RecurringServicesResponse = z.infer<typeof RecurringServicesResponseSchema>;
export type RecurringSlot = z.infer<typeof RecurringSlotSchema>;
export type RecurringSlotsResponse = z.infer<typeof RecurringSlotsResponseSchema>;
export type RecurringBooking = z.infer<typeof RecurringBookingSchema>;
export type RecurringBookingsList = z.infer<typeof RecurringBookingsListSchema>;
export type RecurringBookingDetail = z.infer<typeof RecurringBookingDetailSchema>['recurringBooking'];
export type Occurrence = z.infer<typeof OccurrenceSchema>;

export interface CreateRecurringBody {
  barberId: string;
  services: { barberServiceId: string; bookingType: 'regular' | 'day_off' }[];
  dayOfWeek: number;
  slotTime: string;
  frequency: 'weekly' | 'biweekly';
}

export interface PauseBody {
  pauseStartDate: string;
  pauseEndDate?: string;
}

interface ListParams {
  status?: z.infer<typeof RecurringStatus>;
  cursor?: string;
  limit?: number;
}

interface RequestOptions {
  signal?: AbortSignal;
}

// ── Endpoints ──

export async function getRecurringServices(
  barberId: string,
  opts: RequestOptions = {},
): Promise<RecurringServicesResponse> {
  const { data } = await apiClient.get(
    `/barbers/${barberId}/services/recurring`,
    { signal: opts.signal },
  );
  return RecurringServicesResponseSchema.parse(data);
}

export async function getRecurringSlots(
  barberId: string,
  params: { serviceIds: string[]; dayOfWeek: number },
  opts: RequestOptions = {},
): Promise<RecurringSlotsResponse> {
  const { data } = await apiClient.get(
    `/client/barbers/${barberId}/recurring-slots`,
    { params, signal: opts.signal },
  );
  return RecurringSlotsResponseSchema.parse(data);
}

export async function createRecurringBooking(
  body: CreateRecurringBody,
  opts: RequestOptions = {},
): Promise<RecurringBooking> {
  const { data } = await apiClient.post('/client/recurring-bookings', body, {
    signal: opts.signal,
  });
  return RecurringBookingResponseSchema.parse(data).recurringBooking;
}

export async function listRecurringBookings(
  params: ListParams = {},
  opts: RequestOptions = {},
): Promise<RecurringBookingsList> {
  const { data } = await apiClient.get('/client/recurring-bookings', {
    params,
    signal: opts.signal,
  });
  return RecurringBookingsListSchema.parse(data);
}

export async function getRecurringBookingDetail(
  id: string,
  opts: RequestOptions = {},
): Promise<RecurringBookingDetail> {
  const { data } = await apiClient.get(`/client/recurring-bookings/${id}`, {
    signal: opts.signal,
  });
  return RecurringBookingDetailSchema.parse(data).recurringBooking;
}

export async function pauseRecurringBooking(
  id: string,
  body: PauseBody,
  opts: RequestOptions = {},
): Promise<RecurringBooking> {
  const { data } = await apiClient.patch(
    `/client/recurring-bookings/${id}/pause`,
    body,
    { signal: opts.signal },
  );
  return RecurringBookingResponseSchema.parse(data).recurringBooking;
}

export async function resumeRecurringBooking(
  id: string,
  opts: RequestOptions = {},
): Promise<RecurringBooking> {
  const { data } = await apiClient.patch(
    `/client/recurring-bookings/${id}/resume`,
    undefined,
    { signal: opts.signal },
  );
  return RecurringBookingResponseSchema.parse(data).recurringBooking;
}

export async function cancelRecurringBooking(
  id: string,
  opts: RequestOptions = {},
): Promise<RecurringBooking> {
  const { data } = await apiClient.patch(
    `/client/recurring-bookings/${id}/cancel`,
    undefined,
    { signal: opts.signal },
  );
  return RecurringBookingResponseSchema.parse(data).recurringBooking;
}

export async function renewRecurringBooking(
  id: string,
  opts: RequestOptions = {},
): Promise<RecurringBooking> {
  const { data } = await apiClient.post(
    `/client/recurring-bookings/${id}/renew`,
    undefined,
    { signal: opts.signal },
  );
  return RecurringBookingResponseSchema.parse(data).recurringBooking;
}
