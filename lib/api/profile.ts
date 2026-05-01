import { z } from 'zod';
import { BookingStatus } from '@/lib/schemas/enums';
import { apiClient } from './client';

// ── Response schemas ──

const NextUpcomingBookingSchema = z.object({
  id: z.string(),
  barberId: z.string(),
  barberName: z.string(),
  barberProfileImage: z.string().nullable(),
  serviceName: z.string(),
  scheduledAt: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  durationMinutes: z.number(),
  status: BookingStatus,
  isRecurring: z.boolean(),
  recurringBookingId: z.string().nullable(),
});

const ClientProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  profilePhotoUrl: z.string().nullable(),
  email: z.string().nullable(),
  subscriptionStatus: z.enum(['inactive', 'active', 'past_due', 'cancelled']),
  subscriptionExpiresAt: z.string().nullable(),
  createdAt: z.string(),
  nextUpcomingBooking: NextUpcomingBookingSchema.nullable(),
});

// ── Public types ──

export type ClientProfile = z.infer<typeof ClientProfileSchema>;
export type NextUpcomingBooking = z.infer<typeof NextUpcomingBookingSchema>;

export interface RNFile {
  uri: string;
  type: string;
  name: string;
}

export interface UpdateProfileBody {
  name?: string;
  username?: string;
  photo?: RNFile;
}

interface RequestOptions {
  signal?: AbortSignal;
}

// ── Helpers ──

function appendRNFile(form: FormData, key: string, file: RNFile): void {
  form.append(key, file as unknown as Blob);
}

// ── Endpoints ──

export async function getProfile(
  opts: RequestOptions = {},
): Promise<ClientProfile> {
  const { data } = await apiClient.get('/client/profile', {
    signal: opts.signal,
  });
  return ClientProfileSchema.parse(data);
}

export async function updateProfile(
  body: UpdateProfileBody,
  opts: RequestOptions = {},
): Promise<ClientProfile> {
  const hasFile = !!body.photo;

  if (hasFile) {
    const form = new FormData();
    if (body.photo) appendRNFile(form, 'photo', body.photo);
    if (body.name !== undefined) form.append('name', body.name);
    if (body.username !== undefined) form.append('username', body.username);

    const { data } = await apiClient.patch('/client/profile', form, {
      signal: opts.signal,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return ClientProfileSchema.parse(data);
  }

  const { name, username } = body;
  const { data } = await apiClient.patch(
    '/client/profile',
    { name, username },
    { signal: opts.signal },
  );
  return ClientProfileSchema.parse(data);
}
