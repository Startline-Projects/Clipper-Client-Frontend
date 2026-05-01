import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookingFlowStore } from '@/lib/stores/booking-flow';
import { invalidations } from './invalidations';
import * as bookingsApi from '@/lib/api/bookings';
import type { BookingBody } from '@/lib/api/bookings';

function buildBody(): BookingBody {
  const { barberId, selectedServices, selectedDate, selectedSlot } =
    useBookingFlowStore.getState();
  if (!barberId || !selectedDate || !selectedSlot) {
    throw new Error('Booking flow incomplete');
  }
  return {
    barberId,
    services: selectedServices,
    date: selectedDate,
    slotTime: selectedSlot,
  };
}

export function usePreviewBooking() {
  return useMutation({
    mutationFn: () => bookingsApi.previewBooking(buildBody()),
    onSuccess: (res) => {
      useBookingFlowStore.getState().setPreview(res.preview);
    },
  });
}

export function useConfirmBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => bookingsApi.confirmBooking(buildBody()),
    onSuccess: () => {
      useBookingFlowStore.getState().reset();
      invalidations.bookingConfirmed(qc);
    },
  });
}
