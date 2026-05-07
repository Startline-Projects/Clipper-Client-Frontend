import { z } from 'zod';
import { ServiceType } from '@/lib/schemas/enums';
import { apiClient } from './client';
import type { BarberSort, RecurringFilter } from '@/lib/schemas/enums';

// ── Response schemas ──

const DistanceSchema = z.object({
  km: z.number(),
  miles: z.number(),
});

const BarberListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  profileImage: z.string().nullable(),
  averageRating: z.number(),
  totalReviews: z.number(),
  distance: DistanceSchema,
  recurringAvailable: z.boolean(),
  topServices: z.array(z.object({ name: z.string() })),
});

const PaginationSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalBarbers: z.number(),
  limit: z.number(),
  hasNextPage: z.boolean(),
});

const ListBarbersResponseSchema = z.object({
  barbers: z.array(BarberListItemSchema),
  pagination: PaginationSchema,
});

const WorkingHourSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  isWorking: z.boolean(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
});

const BarberServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  serviceType: ServiceType,
  regularPrice: z.number(),
  durationMinutes: z.number(),
});

const BarberReviewSchema = z.object({
  id: z.string(),
  reviewerName: z.string(),
  reviewerProfileImage: z.string().nullable(),
  rating: z.number().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.string(),
});

const ReviewsSummarySchema = z.object({
  averageRating: z.number(),
  totalReviews: z.number(),
});

const BarberDetailSchema = z.object({
  barber: z.object({
    id: z.string(),
    name: z.string(),
    profileImage: z.string().nullable(),
    bio: z.string().nullable(),
    address: z.string().nullable(),
    phone: z.string().nullable(),
    workingHours: z.array(WorkingHourSchema),
    recurringAvailable: z.boolean(),
    barberName: z.string().nullable().optional(),
    shopName: z.string().nullable().optional(),
  }),
  services: z.array(BarberServiceSchema),
  reviews: z.array(BarberReviewSchema),
  reviewsSummary: ReviewsSummarySchema,
  distance: DistanceSchema,
});

// ── Public types ──

export type BarberListItem = z.infer<typeof BarberListItemSchema>;
export type ListBarbersResponse = z.infer<typeof ListBarbersResponseSchema>;
export type BarberDetail = z.infer<typeof BarberDetailSchema>;
export type BarberService = z.infer<typeof BarberServiceSchema>;
export type BarberReview = z.infer<typeof BarberReviewSchema>;
export type WorkingHour = z.infer<typeof WorkingHourSchema>;
export type ReviewsSummary = z.infer<typeof ReviewsSummarySchema>;
export type Distance = z.infer<typeof DistanceSchema>;

export interface ListBarbersParams {
  latitude: number;
  longitude: number;
  sort?: BarberSort;
  recurring?: RecurringFilter;
  search?: string;
  page?: number;
  limit?: number;
}

interface RequestOptions {
  signal?: AbortSignal;
}

// ── Endpoints ──

export async function listBarbers(
  params: ListBarbersParams,
  opts: RequestOptions = {},
): Promise<ListBarbersResponse> {
  const { data } = await apiClient.get('/client/barbers', {
    params,
    signal: opts.signal,
  });
  return ListBarbersResponseSchema.parse(data);
}

export async function getBarberDetail(
  barberId: string,
  coords: { latitude: number; longitude: number },
  opts: RequestOptions = {},
): Promise<BarberDetail> {
  const { data } = await apiClient.get(`/client/barbers/${barberId}`, {
    params: coords,
    signal: opts.signal,
  });
  return BarberDetailSchema.parse(data);
}
