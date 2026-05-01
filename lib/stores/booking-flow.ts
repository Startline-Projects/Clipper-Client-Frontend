import { create } from 'zustand';
import type { BookingType } from '@/lib/schemas/enums';

interface SelectedService {
  barberServiceId: string;
  bookingType: BookingType;
}

interface PreviewPricing {
  basePrice: number;
  additionalCost: number;
  totalPrice: number;
}

interface PreviewService {
  id: string;
  name: string;
  durationMinutes: number;
  bookingType: BookingType;
  startOffsetMinutes: number;
  pricing: PreviewPricing;
}

interface PreviewData {
  scheduledAt: string;
  totalDurationMinutes: number;
  services: PreviewService[];
  pricing: PreviewPricing;
  barber: { id: string; name: string };
}

interface BookingFlowState {
  barberId: string | null;
  barberName: string | null;
  selectedServices: SelectedService[];
  selectedDate: string | null;
  selectedSlot: string | null;
  previewData: PreviewData | null;

  setBarberId: (id: string, name: string) => void;
  addService: (service: SelectedService) => void;
  removeService: (barberServiceId: string) => void;
  clearServices: () => void;
  setDate: (date: string | null) => void;
  setSlot: (slot: string | null) => void;
  setPreview: (data: PreviewData | null) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  barberId: null,
  barberName: null,
  selectedServices: [],
  selectedDate: null,
  selectedSlot: null,
  previewData: null,
};

export const useBookingFlowStore = create<BookingFlowState>((set) => ({
  ...INITIAL_STATE,

  setBarberId: (id, name) => set({ barberId: id, barberName: name }),

  addService: (service) =>
    set((s) => {
      if (s.selectedServices.length >= 4) return s;
      if (s.selectedServices.some((ss) => ss.barberServiceId === service.barberServiceId)) return s;
      return { selectedServices: [...s.selectedServices, service] };
    }),

  removeService: (barberServiceId) =>
    set((s) => ({
      selectedServices: s.selectedServices.filter(
        (ss) => ss.barberServiceId !== barberServiceId,
      ),
    })),

  clearServices: () => set({ selectedServices: [] }),

  setDate: (selectedDate) => set({ selectedDate, selectedSlot: null, previewData: null }),

  setSlot: (selectedSlot) => set({ selectedSlot, previewData: null }),

  setPreview: (previewData) => set({ previewData }),

  reset: () => set(INITIAL_STATE),
}));
