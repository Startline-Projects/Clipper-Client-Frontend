import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth.store';
import { invalidations } from './invalidations';
import * as authApi from '@/lib/api/auth';

export function useRegister() {
  return useMutation({
    mutationFn: (body: authApi.RegisterBody) => authApi.register(body),
    onSuccess: async (res) => {
      const { setTokens, markLaunched } = useAuthStore.getState();
      await setTokens(res.accessToken, res.refreshToken);
      await markLaunched();
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (body: authApi.LoginBody) => authApi.login(body),
    onSuccess: async (res) => {
      const { setTokens, setUser, markLaunched } = useAuthStore.getState();
      await setTokens(res.accessToken, res.refreshToken);
      setUser({ id: res.id, email: res.email, username: res.username });
      await markLaunched();
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
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
    mutationFn: (body: { email: string }) => authApi.forgotPassword(body),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: { token: string; newPassword: string }) =>
      authApi.resetPassword(body),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(body),
  });
}
