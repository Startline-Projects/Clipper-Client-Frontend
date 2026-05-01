import { z } from 'zod';
import { apiClient } from './client';

// ── Response schemas ──

const CreatedReviewSchema = z.object({
  review: z.object({
    id: z.string(),
    bookingId: z.string(),
    rating: z.number(),
    comment: z.string().nullable(),
    createdAt: z.string(),
  }),
});

const ReviewItemSchema = z.object({
  id: z.string(),
  client: z.object({
    name: z.string(),
    profilePhotoUrl: z.string().nullable(),
  }),
  rating: z.number(),
  comment: z.string().nullable(),
  relativeTime: z.string(),
  createdAt: z.string(),
});

const ReviewsListResponseSchema = z.object({
  barber: z.object({
    id: z.string(),
    name: z.string(),
    averageRating: z.number().nullable(),
    totalReviews: z.number(),
  }),
  reviews: z.array(ReviewItemSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

// ── Public types ──

export type CreatedReview = z.infer<typeof CreatedReviewSchema>['review'];
export type ReviewItem = z.infer<typeof ReviewItemSchema>;
export type ReviewsListResponse = z.infer<typeof ReviewsListResponseSchema>;

export interface CreateReviewBody {
  rating: number;
  comment?: string;
}

export interface ListReviewsParams {
  cursor?: string;
  limit?: number;
  rating?: number;
}

interface RequestOptions {
  signal?: AbortSignal;
}

// ── Endpoints ──

export async function createReview(
  bookingId: string,
  body: CreateReviewBody,
  opts: RequestOptions = {},
): Promise<CreatedReview> {
  const { data } = await apiClient.post(
    `/client/bookings/${bookingId}/review`,
    body,
    { signal: opts.signal },
  );
  return CreatedReviewSchema.parse(data).review;
}

export async function listBarberReviews(
  barberId: string,
  params: ListReviewsParams = {},
  opts: RequestOptions = {},
): Promise<ReviewsListResponse> {
  const { data } = await apiClient.get(
    `/client/barbers/${barberId}/reviews`,
    { params, signal: opts.signal },
  );
  return ReviewsListResponseSchema.parse(data);
}
