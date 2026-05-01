import { z } from 'zod';
import { apiClient } from './client';

// ── Response schemas ──

const SlotSchema = z.object({
  time: z.string(),
  endTime: z.string(),
  available: z.boolean(),
  price: z.number(),
});

const DaySlotsSchema = z.object({
  regular: z.array(SlotSchema),
  afterHours: z.array(SlotSchema),
  dayOff: z.array(SlotSchema),
});

const AvailabilityDaySchema = z.object({
  date: z.string(),
  dayOfWeek: z.number().min(0).max(6),
  isWorkingDay: z.boolean(),
  slotDurationMinutes: z.number().nullable(),
  slots: DaySlotsSchema,
});

const AvailabilityServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationMinutes: z.number(),
  regularPrice: z.number(),
  afterHoursPrice: z.number().nullable(),
  dayOffPrice: z.number().nullable(),
});

const AvailabilityResponseSchema = z.object({
  barberId: z.string(),
  services: z.array(AvailabilityServiceSchema),
  totalDurationMinutes: z.number(),
  days: z.array(AvailabilityDaySchema),
});

// ── Public types ──

export type Slot = z.infer<typeof SlotSchema>;
export type DaySlots = z.infer<typeof DaySlotsSchema>;
export type AvailabilityDay = z.infer<typeof AvailabilityDaySchema>;
export type AvailabilityService = z.infer<typeof AvailabilityServiceSchema>;
export type AvailabilityResponse = z.infer<typeof AvailabilityResponseSchema>;

export interface GetAvailabilityParams {
  barberId: string;
  serviceIds: string[];
  startDate: string;
  endDate: string;
}

interface RequestOptions {
  signal?: AbortSignal;
}

// ── Endpoints ──

export async function getAvailability(
  params: GetAvailabilityParams,
  opts: RequestOptions = {},
): Promise<AvailabilityResponse> {
  const { barberId, serviceIds, startDate, endDate } = params;
  const { data } = await apiClient.get(`/barbers/${barberId}/availability`, {
    params: { serviceIds, startDate, endDate },
    signal: opts.signal,
  });
  return AvailabilityResponseSchema.parse(data);
}
