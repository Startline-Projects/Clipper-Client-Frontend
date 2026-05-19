import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth.store';
import { invalidations } from './invalidations';
import * as authApi from '@/lib/api/auth';
import { updateProfile } from '@/lib/api/profile';

interface RegisterInput extends authApi.RegisterBody {
  name?: string;
}

export function useRegister() {
  return useMutation({
    meta: { silent: true },
    mutationFn: async ({ name, ...body }: RegisterInput) => {
      const tokens = await authApi.register(body);
      return { tokens, name, email: body.email };
    },
    onSuccess: async ({ tokens, name, email }) => {
      const { setTokens, markLaunched, setEmail, setEmailVerified } =
        useAuthStore.getState();
      await setTokens(tokens.accessToken, tokens.refreshToken);
      if (name) {
        try { await updateProfile({ name }); } catch {}
      }
      await setEmail(email);
      await setEmailVerified(false);
      await markLaunched();
    },
  });
}

export function useLogin() {
  return useMutation({
    meta: { silent: true },
    mutationFn: (body: authApi.LoginBody) => authApi.login(body),
    onSuccess: async (res) => {
      const { setTokens, setUser, markLaunched, setEmail } =
        useAuthStore.getState();
      await setTokens(res.accessToken, res.refreshToken);
      setUser({ id: res.id, email: res.email, username: res.username });
      await setEmail(res.email);
      await markLaunched();
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: async () => {
      const { logout } = useAuthStore.getState();
      try {
        await authApi.logout();
      } catch {
        /* best-effort server cleanup */
      }
      await logout();
      invalidations.onLogout(qc);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    meta: { silent: true },
    mutationFn: (body: { email: string }) => authApi.forgotPassword(body),
  });
}

export function useResetPassword() {
  return useMutation({
    meta: { silent: true },
    mutationFn: (body: { email: string; code: string; newPassword: string }) =>
      authApi.resetPassword(body),
  });
}

export function useChangePassword() {
  return useMutation({
    meta: { silent: true },
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(body),
  });
}

export function useChangeEmail() {
  return useMutation({
    meta: { silent: true },
    mutationFn: (body: { currentPassword: string; newEmail: string }) =>
      authApi.changeEmail(body),
    onSuccess: async (_data, vars) => {
      const { setEmail, setEmailVerified } = useAuthStore.getState();
      await setEmail(vars.newEmail);
      await setEmailVerified(false);
    },
  });
}
