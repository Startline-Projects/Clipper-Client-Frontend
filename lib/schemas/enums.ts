import { z } from 'zod';

export const ServiceType = z.enum(['haircut', 'beard', 'haircut_beard', 'eyebrows', 'other']);

export const BookingType = z.enum(['regular', 'after_hours', 'day_off']);

export const BookingStatus = z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']);

export const RecurringFrequency = z.enum(['weekly', 'biweekly']);

export const RecurringStatus = z.enum([
  'pending_barber_approval',
  'pending_client_approval',
  'active',
  'paused',
  'cancelled',
  'expired',
  'rejected',
  'ended',
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
  'recurring_arrangement_offered',
  'recurring_arrangement_accepted',
  'recurring_arrangement_rejected',
  'subscription_activated',
  'subscription_reactivated',
  'subscription_cancel_scheduled',
  'subscription_cancelled',
  'subscription_past_due',
  'no_show_recorded',
  'no_show_resolved',
  'recurring_paused',
  'recurring_resumed',
]);

export const RecurringArrangementStatus = z.enum([
  'pending_client_approval',
  'active',
  'rejected',
  'cancelled',
  'ended',
]);

export const ArrangementFrequency = z.enum(['weekly', 'biweekly', 'every_n_weeks', 'monthly']);

export const ArrangementEndType = z.enum(['none', 'after_count', 'on_date']);

export const CancelledBy = z.enum(['client', 'barber']);

export const DevicePlatform = z.enum(['ios', 'android']);

export const SenderRole = z.enum(['barber', 'client']);

export const ThemePreference = z.enum(['system', 'light', 'dark']);

export const BarberCategoryTag = z.enum([
  'ALL_GENDER_CUTS',
  'KIDS_CUTS',
  'CURLY_HAIR_SPECIALIST',
  'AFRO_HAIR_SPECIALIST',
  'BRAIDS',
  'BEARD_SPECIALIST',
  'SKIN_FADES',
  'WOMENS_HAIRCUTS',
  'LOCS_DREADLOCKS',
  'HAIR_DESIGN',
  'SHAVES',
  'MOBILE_BARBER',
  'IN_HOUSE_SERVICES',
]);

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
export type RecurringArrangementStatus = z.infer<typeof RecurringArrangementStatus>;
export type ArrangementFrequency = z.infer<typeof ArrangementFrequency>;
export type ArrangementEndType = z.infer<typeof ArrangementEndType>;
export type CancelledBy = z.infer<typeof CancelledBy>;
export type DevicePlatform = z.infer<typeof DevicePlatform>;
export type SenderRole = z.infer<typeof SenderRole>;
export type ThemePreference = z.infer<typeof ThemePreference>;
export type BarberCategoryTag = z.infer<typeof BarberCategoryTag>;
