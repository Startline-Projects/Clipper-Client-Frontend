import { z } from 'zod';
import { DevicePlatform } from '@/lib/schemas/enums';
import { apiClient } from './client';

// ── Response schemas ──

const RegisterResponseSchema = z.object({
  id: z.string(),
  token: z.string(),
  platform: DevicePlatform,
});

const RemoveResponseSchema = z.object({
  removed: z.literal(true),
});

// ── Public types ──

export interface RegisterTokenBody {
  token: string;
  platform: z.infer<typeof DevicePlatform>;
}

interface RequestOptions {
  signal?: AbortSignal;
}

// ── Endpoints ──

export async function registerDeviceToken(
  body: RegisterTokenBody,
  opts: RequestOptions = {},
): Promise<void> {
  const { data } = await apiClient.post('/device-token', body, {
    signal: opts.signal,
  });
  RegisterResponseSchema.parse(data);
}

export async function removeDeviceToken(
  token: string,
  opts: RequestOptions = {},
): Promise<void> {
  const { data } = await apiClient.delete('/device-token', {
    data: { token },
    signal: opts.signal,
  });
  RemoveResponseSchema.parse(data);
}
