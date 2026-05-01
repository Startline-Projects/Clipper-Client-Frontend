import { z } from 'zod';
import { NotificationType } from '@/lib/schemas/enums';
import { apiClient } from './client';

// ── Response schemas ──

const NotificationSchema = z.object({
  id: z.string(),
  type: NotificationType,
  title: z.string(),
  body: z.string(),
  data: z.record(z.unknown()),
  isRead: z.boolean(),
  bookingId: z.string().nullable(),
  recurringBookingId: z.string().nullable(),
  conversationId: z.string().nullable(),
  messageId: z.string().nullable(),
  createdAt: z.string(),
});

const NotificationsListResponseSchema = z.object({
  notifications: z.array(NotificationSchema),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalNotifications: z.number(),
    limit: z.number(),
    hasNextPage: z.boolean(),
  }),
});

const UnreadCountResponseSchema = z.object({
  unreadCount: z.number(),
});

const MarkReadResponseSchema = z.object({
  id: z.string(),
  isRead: z.literal(true),
});

// ── Public types ──

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationsListResponse = z.infer<typeof NotificationsListResponseSchema>;

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
}

interface RequestOptions {
  signal?: AbortSignal;
}

// ── Endpoints ──

export async function listNotifications(
  params: ListNotificationsParams = {},
  opts: RequestOptions = {},
): Promise<NotificationsListResponse> {
  const { data } = await apiClient.get('/client/notifications', {
    params,
    signal: opts.signal,
  });
  return NotificationsListResponseSchema.parse(data);
}

export async function getUnreadCount(
  opts: RequestOptions = {},
): Promise<number> {
  const { data } = await apiClient.get('/client/notifications/unread-count', {
    signal: opts.signal,
  });
  return UnreadCountResponseSchema.parse(data).unreadCount;
}

export async function markNotificationRead(
  notificationId: string,
  opts: RequestOptions = {},
): Promise<void> {
  const { data } = await apiClient.put(
    `/client/notifications/${notificationId}/read`,
    undefined,
    { signal: opts.signal },
  );
  MarkReadResponseSchema.parse(data);
}
