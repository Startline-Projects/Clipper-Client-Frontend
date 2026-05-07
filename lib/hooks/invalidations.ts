import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

export const invalidations = {
  profileUpdated: (qc: QueryClient) => {
    qc.invalidateQueries({ queryKey: queryKeys.profile.all });
  },

  subscriptionChanged: (qc: QueryClient) => {
    qc.invalidateQueries({ queryKey: queryKeys.subscription.all });
    qc.invalidateQueries({ queryKey: queryKeys.profile.me() });
  },

  bookingMutated: (qc: QueryClient, bookingId: string) => {
    qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
    qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) });
    qc.invalidateQueries({ queryKey: queryKeys.profile.me() });
  },

  bookingConfirmed: (qc: QueryClient) => {
    qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
    qc.invalidateQueries({ queryKey: queryKeys.profile.me() });
  },

  recurringMutated: (qc: QueryClient, recurringId: string) => {
    qc.invalidateQueries({
      queryKey: queryKeys.recurringBookings.detail(recurringId),
    });
    qc.invalidateQueries({ queryKey: queryKeys.recurringBookings.lists() });
    qc.invalidateQueries({ queryKey: queryKeys.bookings.recurring.lists() });
  },

  arrangementMutated: (qc: QueryClient, arrangementId: string) => {
    qc.invalidateQueries({
      queryKey: queryKeys.arrangements.detail(arrangementId),
    });
    qc.invalidateQueries({ queryKey: queryKeys.arrangements.lists() });
    qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
  },

  reviewCreated: (qc: QueryClient, bookingId: string) => {
    qc.invalidateQueries({ queryKey: queryKeys.reviews.all });
    qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) });
    qc.invalidateQueries({ queryKey: queryKeys.bookings.past.lists() });
    qc.invalidateQueries({ queryKey: queryKeys.barbers.all });
  },

  messageSent: (qc: QueryClient, conversationId: string) => {
    qc.invalidateQueries({
      queryKey: queryKeys.messages.list(conversationId),
    });
    qc.invalidateQueries({ queryKey: queryKeys.conversations.lists() });
  },

  messageReceived: (qc: QueryClient, conversationId: string) => {
    qc.invalidateQueries({
      queryKey: queryKeys.messages.list(conversationId),
    });
    qc.invalidateQueries({ queryKey: queryKeys.conversations.lists() });
    qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
  },

  notificationRead: (qc: QueryClient) => {
    qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
  },

  onLogout: (qc: QueryClient) => qc.clear(),
};
