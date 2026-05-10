import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useProfile } from '@/lib/hooks/useProfile';
import { useSubscriptionGate } from '@/lib/hooks/useSubscriptionGate';
import { useRealtimeAuth } from '@/lib/hooks/useRealtimeAuth';
import { useRealtimeUnread } from '@/lib/hooks/useRealtimeUnread';
import {
  registerPushToken,
  setupNotificationListeners,
} from '@/lib/utils/push-notifications';

export default function AppLayout() {
  const accessToken = useAuthStore((s) => s.accessToken);

  useProfile();
  useSubscriptionGate();
  useRealtimeAuth();
  useRealtimeUnread();

  useEffect(() => {
    if (!accessToken) return;

    registerPushToken().then((token) => {
      if (token) useAuthStore.getState().setPushToken(token);
    });

    const cleanup = setupNotificationListeners();
    return cleanup;
  }, [accessToken]);

  if (!accessToken) return <Redirect href="/(auth)/welcome" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
