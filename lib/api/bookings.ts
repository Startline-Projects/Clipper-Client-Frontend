import { z } from 'zod';
import { BookingType, BookingStatus, CancelledBy } from '@/lib/schemas/enums';
import { apiClient } from './client';

// ── Shared sub-schemas ──

const PricingSchema = z.object({
  basePrice: z.number(),
  additionalCost: z.number(),
  totalPrice: z.number(),
});

const BookingServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationMinutes: z.number(),
  bookingType: BookingType,
  startOffsetMinutes: z.number(),
  pricing: PricingSchema,
});

const BarberRefSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// ── Preview ──

const PreviewResponseSchema = z.object({
  preview: z.object({
    scheduledAt: z.string(),
    totalDurationMinutes: z.number(),
    services: z.array(BookingServiceSchema),
    pricing: PricingSchema,
    barber: BarberRefSchema,
  }),
});

// ── Confirm ──

const ConfirmResponseSchema = z.object({
  booking: z.object({
    id: z.string(),
    status: BookingStatus,
    scheduledAt: z.string(),
    totalDurationMinutes: z.number(),
    services: z.array(BookingServiceSchema),
    pricing: PricingSchema,
    barber: BarberRefSchema,
    confirmedAt: z.string().nullable(),
  }),
});

// ── Upcoming list ──

const UpcomingBookingSchema = z.object({
  id: z.string(),
  barberName: z.string(),
  barberProfileImage: z.string().nullable(),
  serviceName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  durationMinutes: z.number(),
  status: BookingStatus,
  isRecurring: z.boolean(),
});

const UpcomingPaginationSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalBookings: z.number(),
  limit: z.number(),
  hasNextPage: z.boolean(),
});

const UpcomingResponseSchema = z.object({
  bookings: z.array(UpcomingBookingSchema),
  pagination: UpcomingPaginationSchema,
});

// ── Past list ──

const PastBookingSchema = z.object({
  id: z.string(),
  barberName: z.string(),
  barberProfileImage: z.string().nullable(),
  serviceName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  pricePaid: z.number(),
  hasReview: z.boolean(),
});

const PastResponseSchema = z.object({
  bookings: z.array(PastBookingSchema),
  pagination: UpcomingPaginationSchema,
});

// ── Recurring list (collapsed) ──

const ClientRecurringBookingSchema = z.object({
  id: z.string(),
  barberName: z.string(),
  barberProfileImage: z.string().nullable(),
  serviceName: z.string(),
  nextAppointmentDate: z.string().nullable(),
  appointmentTime: z.string().nullable(),
  durationMinutes: z.number(),
  bookingStatus: BookingStatus.nullable(),
  recurringStatus: z.enum(['active', 'paused', 'pending_approval']),
  appointmentsLeft: z.number(),
});

const RecurringListResponseSchema = z.object({
  bookings: z.array(ClientRecurringBookingSchema),
  pagination: UpcomingPaginationSchema,
});

// ── Detail ──

const BookingDetailSchema = z.object({
  booking: z.object({
    id: z.string(),
    barber: z.object({
      id: z.string(),
      name: z.string(),
      profilePhotoUrl: z.string().nullable(),
    }),
    services: z.array(BookingServiceSchema),
    scheduledAt: z.string(),
    totalDurationMinutes: z.number(),
    totalPrice: z.number(),
    status: BookingStatus,
    cancelledAt: z.string().nullable(),
    cancelledBy: CancelledBy.nullable(),
    noShowCharged: z.boolean(),
    noShowChargeAmountUsd: z.number().nullable(),
    pricing: PricingSchema,
    confirmedAt: z.string().nullable(),
    review: z
      .object({
        id: z.string(),
        rating: z.number(),
        comment: z.string().nullable(),
        createdAt: z.string(),
      })
      .nullable(),
    isRecurring: z.boolean(),
    recurringBookingId: z.string().nullable(),
  }),
});

// ── Cancel ──

const CancelResponseSchema = z.object({
  booking: z.object({
    id: z.string(),
    status: z.literal('cancelled'),
    scheduledAt: z.string(),
    cancelledAt: z.string(),
    cancelledBy: z.literal('client'),
  }),
});

// ── Public types ──

export type PreviewResponse = z.infer<typeof PreviewResponseSchema>;
export type ConfirmResponse = z.infer<typeof ConfirmResponseSchema>;
export type UpcomingBooking = z.infer<typeof UpcomingBookingSchema>;
export type UpcomingResponse = z.infer<typeof UpcomingResponseSchema>;
export type PastBooking = z.infer<typeof PastBookingSchema>;
export type PastResponse = z.infer<typeof PastResponseSchema>;
export type ClientRecurringBooking = z.infer<typeof ClientRecurringBookingSchema>;
export type RecurringListResponse = z.infer<typeof RecurringListResponseSchema>;
export type BookingDetail = z.infer<typeof BookingDetailSchema>['booking'];
export type BookingDetailResponse = z.infer<typeof BookingDetailSchema>;
export type CancelResponse = z.infer<typeof CancelResponseSchema>;
export type BookingService = z.infer<typeof BookingServiceSchema>;
export type Pricing = z.infer<typeof PricingSchema>;

export interface BookingBody {
  barberId: string;
  services: { barberServiceId: string; bookingType: z.infer<typeof BookingType> }[];
  date: string;
  slotTime: string;
}

interface RequestOptions {
  signal?: AbortSignal;
}

// ── Endpoints ──

export async function previewBooking(
  body: BookingBody,
  opts: RequestOptions = {},
): Promise<PreviewResponse> {
  const { data } = await apiClient.post('/bookings/preview', body, {
    signal: opts.signal,
  });
  return PreviewResponseSchema.parse(data);
}

export async function confirmBooking(
  body: BookingBody,
  opts: RequestOptions = {},
): Promise<ConfirmResponse> {
  const { data } = await apiClient.post('/bookings/confirm', body, {
    signal: opts.signal,
  });
  return ConfirmResponseSchema.parse(data);
}

export async function listUpcomingBookings(
  params: { page?: number; limit?: number } = {},
  opts: RequestOptions = {},
): Promise<UpcomingResponse> {
  const { data } = await apiClient.get('/client/bookings/upcoming', {
    params,
    signal: opts.signal,
  });
  return UpcomingResponseSchema.parse(data);
}

export async function listPastBookings(
  params: { page?: number; limit?: number } = {},
  opts: RequestOptions = {},
): Promise<PastResponse> {
  const { data } = await apiClient.get('/client/bookings/past', {
    params,
    signal: opts.signal,
  });
  return PastResponseSchema.parse(data);
}

export async function listRecurringBookings(
  params: { page?: number; limit?: number } = {},
  opts: RequestOptions = {},
): Promise<RecurringListResponse> {
  const { data } = await apiClient.get('/client/bookings/recurring', {
    params,
    signal: opts.signal,
  });
  return RecurringListResponseSchema.parse(data);
}

export async function getBookingDetail(
  id: string,
  opts: RequestOptions = {},
): Promise<BookingDetail> {
  const { data } = await apiClient.get(`/client/bookings/${id}`, {
    signal: opts.signal,
  });
  return BookingDetailSchema.parse(data).booking;
}

export async function cancelBooking(
  id: string,
  opts: RequestOptions = {},
): Promise<CancelResponse> {
  const { data } = await apiClient.patch(
    `/client/bookings/${id}/cancel`,
    undefined,
    { signal: opts.signal },
  );
  return CancelResponseSchema.parse(data);
}
