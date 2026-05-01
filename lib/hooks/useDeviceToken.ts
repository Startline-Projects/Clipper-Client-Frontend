import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth.store';
import * as deviceTokenApi from '@/lib/api/device-token';
import type { RegisterTokenBody } from '@/lib/api/device-token';

export function useRegisterDeviceToken() {
  return useMutation({
    mutationFn: (body: RegisterTokenBody) =>
      deviceTokenApi.registerDeviceToken(body),
    onSuccess: (_data, body) => {
      useAuthStore.getState().setPushToken(body.token);
    },
  });
}

export function useRemoveDeviceToken() {
  return useMutation({
    mutationFn: (token: string) => deviceTokenApi.removeDeviceToken(token),
    onSuccess: () => {
      useAuthStore.getState().setPushToken(null);
    },
  });
}
