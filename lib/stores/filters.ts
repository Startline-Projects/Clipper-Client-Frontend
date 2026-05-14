import { create } from 'zustand';
import type { BarberSort, RecurringFilter, BarberCategoryTag } from '@/lib/schemas/enums';

type BookingsTab = 'Upcoming' | 'Past' | 'Recurring';

interface FiltersState {
  bookingsTab: BookingsTab;
  exploreSort: BarberSort;
  exploreSearch: string;
  exploreRecurringFilter: RecurringFilter | null;
  exploreCategories: BarberCategoryTag[];
  conversationSearch: string;

  setBookingsTab: (tab: BookingsTab) => void;
  setExploreSort: (sort: BarberSort) => void;
  setExploreSearch: (search: string) => void;
  setExploreRecurringFilter: (filter: RecurringFilter | null) => void;
  setExploreCategories: (categories: BarberCategoryTag[]) => void;
  toggleExploreCategory: (category: BarberCategoryTag) => void;
  clearExploreCategories: () => void;
  setConversationSearch: (search: string) => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  bookingsTab: 'Upcoming',
  exploreSort: 'nearest',
  exploreSearch: '',
  exploreRecurringFilter: null,
  exploreCategories: [],
  conversationSearch: '',

  setBookingsTab: (bookingsTab) => set({ bookingsTab }),
  setExploreSort: (exploreSort) => set({ exploreSort }),
  setExploreSearch: (exploreSearch) => set({ exploreSearch }),
  setExploreRecurringFilter: (exploreRecurringFilter) => set({ exploreRecurringFilter }),
  setExploreCategories: (exploreCategories) => set({ exploreCategories }),
  toggleExploreCategory: (category) =>
    set((s) => ({
      exploreCategories: s.exploreCategories.includes(category)
        ? s.exploreCategories.filter((c) => c !== category)
        : [...s.exploreCategories, category],
    })),
  clearExploreCategories: () => set({ exploreCategories: [] }),
  setConversationSearch: (conversationSearch) => set({ conversationSearch }),
}));

export const useBookingsTab = () => useFiltersStore((s) => s.bookingsTab);
export const useExploreSort = () => useFiltersStore((s) => s.exploreSort);
export const useExploreSearch = () => useFiltersStore((s) => s.exploreSearch);
export const useExploreRecurringFilter = () => useFiltersStore((s) => s.exploreRecurringFilter);
export const useExploreCategories = () => useFiltersStore((s) => s.exploreCategories);
export const useConversationSearch = () => useFiltersStore((s) => s.conversationSearch);
