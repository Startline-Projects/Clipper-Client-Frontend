import type { BarberSort, RecurringFilter, RecurringStatus, RecurringArrangementStatus } from '@/lib/schemas/enums';

export interface BarbersFilters {
  latitude: number;
  longitude: number;
  sort?: BarberSort;
  search?: string;
  recurring?: RecurringFilter;
}

export interface RecurringBookingsFilters {
  status?: RecurringStatus;
}

export interface ReviewsFilters {
  rating?: number;
}

export interface ConversationsFilters {
  search?: string;
}

export interface ArrangementsFilters {
  status?: RecurringArrangementStatus;
}

export interface NotificationsFilters {
  page?: number;
}

export const queryKeys = {
  profile: {
    all: ['profile'] as const,
    me: () => ['profile', 'me'] as const,
  },

  subscription: {
    all: ['subscription'] as const,
    me: () => ['subscription', 'me'] as const,
    activePlan: () => ['subscription', 'activePlan'] as const,
  },

  barbers: {
    all: ['barbers'] as const,
    lists: () => [...queryKeys.barbers.all, 'list'] as const,
    list: (filters: BarbersFilters) =>
      [...queryKeys.barbers.lists(), filters] as const,
    details: () => [...queryKeys.barbers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.barbers.details(), id] as const,
  },

  availability: {
    all: ['availability'] as const,
    forBarber: (
      barberId: string,
      serviceIds: string[],
      startDate: string,
      endDate: string,
    ) =>
      [
        ...queryKeys.availability.all,
        barberId,
        serviceIds.sort().join(','),
        startDate,
        endDate,
      ] as const,
  },

  bookings: {
    all: ['bookings'] as const,
    upcoming: {
      lists: () => [...queryKeys.bookings.all, 'upcoming', 'list'] as const,
      list: (page?: number) =>
        [...queryKeys.bookings.upcoming.lists(), { page }] as const,
    },
    past: {
      lists: () => [...queryKeys.bookings.all, 'past', 'list'] as const,
      list: (page?: number) =>
        [...queryKeys.bookings.past.lists(), { page }] as const,
    },
    recurring: {
      lists: () => [...queryKeys.bookings.all, 'recurring', 'list'] as const,
      list: (page?: number) =>
        [...queryKeys.bookings.recurring.lists(), { page }] as const,
    },
    details: () => [...queryKeys.bookings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
  },

  recurringBookings: {
    all: ['recurringBookings'] as const,
    lists: () => [...queryKeys.recurringBookings.all, 'list'] as const,
    list: (filters: RecurringBookingsFilters) =>
      [...queryKeys.recurringBookings.lists(), filters] as const,
    details: () => [...queryKeys.recurringBookings.all, 'detail'] as const,
    detail: (id: string) =>
      [...queryKeys.recurringBookings.details(), id] as const,
  },

  recurringServices: {
    all: ['recurringServices'] as const,
    forBarber: (barberId: string) =>
      [...queryKeys.recurringServices.all, barberId] as const,
  },

  recurringSlots: {
    all: ['recurringSlots'] as const,
    forBarber: (barberId: string, serviceIds: string[], dayOfWeek: number) =>
      [
        ...queryKeys.recurringSlots.all,
        barberId,
        serviceIds.sort().join(','),
        dayOfWeek,
      ] as const,
  },

  arrangements: {
    all: ['arrangements'] as const,
    lists: () => [...queryKeys.arrangements.all, 'list'] as const,
    list: (filters: ArrangementsFilters) =>
      [...queryKeys.arrangements.lists(), filters] as const,
    details: () => [...queryKeys.arrangements.all, 'detail'] as const,
    detail: (id: string) =>
      [...queryKeys.arrangements.details(), id] as const,
  },

  reviews: {
    all: ['reviews'] as const,
    forBarber: (barberId: string, filters?: ReviewsFilters) =>
      [...queryKeys.reviews.all, barberId, filters] as const,
  },

  conversations: {
    all: ['conversations'] as const,
    lists: () => [...queryKeys.conversations.all, 'list'] as const,
    list: (filters: ConversationsFilters) =>
      [...queryKeys.conversations.lists(), filters] as const,
  },

  messages: {
    all: ['messages'] as const,
    byConversation: (conversationId: string) =>
      [...queryKeys.messages.all, 'conversation', conversationId] as const,
    list: (conversationId: string) =>
      [...queryKeys.messages.byConversation(conversationId), 'list'] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters: NotificationsFilters) =>
      [...queryKeys.notifications.lists(), filters] as const,
    unreadCount: () =>
      [...queryKeys.notifications.all, 'unreadCount'] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
