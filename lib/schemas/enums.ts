import { z } from 'zod';

export const ServiceType = z.enum(['haircut', 'beard', 'haircut_beard', 'eyebrows', 'other']);

export const BookingType = z.enum(['regular', 'after_hours', 'day_off']);

export const BookingStatus = z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']);

export const RecurringFrequency = z.enum(['weekly', 'biweekly']);

export const RecurringStatus = z.enum([
  'pending_barber_approval',
  'active',
  'paused',
  'cancelled',
  'expired',
]);

export const ClientRecurringStatus = z.enum(['active', 'paused', 'pending_approval']);

export const BarberSort = z.enum(['nearest', 'top_rated']);

export const RecurringFilter = z.enum(['available', 'not_available']);

export const SubscriptionStatus = z.enum(['inactive', 'active', 'past_due', 'cancelled']);

export const SubscriptionPlan = z.enum(['monthly', 'yearly']);

export const NotificationType = z.enum([
  'booking_confirmed',
  'booking_cancelled',
  'recurring_accepted',
  'recurring_refused',
  'recurring_expiring',
  'new_message',
]);

export const CancelledBy = z.enum(['client', 'barber']);

export const DevicePlatform = z.enum(['ios', 'android']);

export const SenderRole = z.enum(['barber', 'client']);

export const ThemePreference = z.enum(['system', 'light', 'dark']);

export type ServiceType = z.infer<typeof ServiceType>;
export type BookingType = z.infer<typeof BookingType>;
export type BookingStatus = z.infer<typeof BookingStatus>;
export type RecurringFrequency = z.infer<typeof RecurringFrequency>;
export type RecurringStatus = z.infer<typeof RecurringStatus>;
export type ClientRecurringStatus = z.infer<typeof ClientRecurringStatus>;
export type BarberSort = z.infer<typeof BarberSort>;
export type RecurringFilter = z.infer<typeof RecurringFilter>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;
export type SubscriptionPlan = z.infer<typeof SubscriptionPlan>;
export type NotificationType = z.infer<typeof NotificationType>;
export type CancelledBy = z.infer<typeof CancelledBy>;
export type DevicePlatform = z.infer<typeof DevicePlatform>;
export type SenderRole = z.infer<typeof SenderRole>;
export type ThemePreference = z.infer<typeof ThemePreference>;
