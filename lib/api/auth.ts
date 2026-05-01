import { z } from 'zod';
import { apiClient } from './client';

// ── Response schemas ──

const TokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

const LoginResponseSchema = TokensSchema.extend({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
});

// ── Public types ──

export type Tokens = z.infer<typeof TokensSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export interface RegisterBody {
  email: string;
  password: string;
  username: string;
}

export interface LoginBody {
  email: string;
  password: string;
  role: 'client';
}

interface RequestOptions {
  signal?: AbortSignal;
}

// ── Endpoints ──

export async function register(
  body: RegisterBody,
  opts: RequestOptions = {},
): Promise<Tokens> {
  const { data } = await apiClient.post('/auth/client/register', body, {
    signal: opts.signal,
  });
  return TokensSchema.parse(data);
}

export async function login(
  body: LoginBody,
  opts: RequestOptions = {},
): Promise<LoginResponse> {
  const { data } = await apiClient.post('/auth/login', body, {
    signal: opts.signal,
  });
  return LoginResponseSchema.parse(data);
}

export async function logout(opts: RequestOptions = {}): Promise<void> {
  await apiClient.post('/auth/logout', undefined, { signal: opts.signal });
}

export async function forgotPassword(
  body: { email: string },
  opts: RequestOptions = {},
): Promise<void> {
  await apiClient.post('/auth/forgot-password', body, { signal: opts.signal });
}

export async function resetPassword(
  body: { token: string; newPassword: string },
  opts: RequestOptions = {},
): Promise<void> {
  await apiClient.post('/auth/reset-password', body, { signal: opts.signal });
}

export async function changePassword(
  body: { currentPassword: string; newPassword: string },
  opts: RequestOptions = {},
): Promise<void> {
  await apiClient.patch('/auth/change-password', body, { signal: opts.signal });
}
