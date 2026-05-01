import { create } from 'zustand';
import type { BarberSort, RecurringFilter } from '@/lib/schemas/enums';

type BookingsTab = 'Upcoming' | 'Past' | 'Recurring';

interface FiltersState {
  bookingsTab: BookingsTab;
  exploreSort: BarberSort;
  exploreSearch: string;
  exploreRecurringFilter: RecurringFilter | null;
  conversationSearch: string;

  setBookingsTab: (tab: BookingsTab) => void;
  setExploreSort: (sort: BarberSort) => void;
  setExploreSearch: (search: string) => void;
  setExploreRecurringFilter: (filter: RecurringFilter | null) => void;
  setConversationSearch: (search: string) => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  bookingsTab: 'Upcoming',
  exploreSort: 'nearest',
  exploreSearch: '',
  exploreRecurringFilter: null,
  conversationSearch: '',

  setBookingsTab: (bookingsTab) => set({ bookingsTab }),
  setExploreSort: (exploreSort) => set({ exploreSort }),
  setExploreSearch: (exploreSearch) => set({ exploreSearch }),
  setExploreRecurringFilter: (exploreRecurringFilter) => set({ exploreRecurringFilter }),
  setConversationSearch: (conversationSearch) => set({ conversationSearch }),
}));

export const useBookingsTab = () => useFiltersStore((s) => s.bookingsTab);
export const useExploreSort = () => useFiltersStore((s) => s.exploreSort);
export const useExploreSearch = () => useFiltersStore((s) => s.exploreSearch);
export const useExploreRecurringFilter = () => useFiltersStore((s) => s.exploreRecurringFilter);
export const useConversationSearch = () => useFiltersStore((s) => s.conversationSearch);
