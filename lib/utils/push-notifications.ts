import { InteractionManager, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { registerDeviceToken, removeDeviceToken } from '@/lib/api/device-token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function requestPushPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return token.data;
  } catch {
    return null;
  }
}

export async function registerPushToken(): Promise<string | null> {
  const granted = await requestPushPermissions();
  if (!granted) return null;

  const token = await getExpoPushToken();
  if (!token) return null;

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  try {
    await registerDeviceToken({ token, platform });
  } catch (err) {
    console.warn('[push] Failed to register device token:', err);
  }

  return token;
}

export async function unregisterPushToken(token: string): Promise<void> {
  try {
    await removeDeviceToken(token);
  } catch {
    // Best-effort cleanup
  }
}

function resolveTapTarget(
  data: Record<string, string | undefined>,
): string | null {
  if (data.conversationId) {
    return `/(app)/(tabs)/messages/${data.conversationId}`;
  }

  const isArrangementType =
    data.type === 'recurring_arrangement_offered' ||
    data.type === 'recurring_arrangement_accepted' ||
    data.type === 'recurring_arrangement_rejected';

  if (isArrangementType && data.recurringBookingId) {
    return `/(app)/(tabs)/bookings/arrangements/${data.recurringBookingId}`;
  }

  const isSubscriptionType =
    data.type === 'subscription_activated' ||
    data.type === 'subscription_reactivated' ||
    data.type === 'subscription_cancel_scheduled' ||
    data.type === 'subscription_cancelled' ||
    data.type === 'subscription_past_due';

  if (isSubscriptionType) {
    return '/(app)/(tabs)/profile/subscription';
  }

  if (data.type === 'no_show_recorded' || data.type === 'no_show_resolved') {
    return '/(app)/(tabs)/profile/no-shows';
  }

  if (data.bookingId) {
    return `/(app)/(tabs)/bookings/${data.bookingId}`;
  }

  if (data.recurringBookingId) {
    return `/(app)/(tabs)/bookings/recurring/${data.recurringBookingId}`;
  }

  return '/(app)/(tabs)/explore/notifications';
}

let lastHandledId: string | null = null;

export function handleNotificationTap(
  response: Notifications.NotificationResponse,
): void {
  const id = response.notification.request.identifier;
  if (id && id === lastHandledId) return;
  lastHandledId = id ?? null;

  const data = response.notification.request.content.data as Record<
    string,
    string | undefined
  >;
  const target = resolveTapTarget(data);
  if (!target) return;

  InteractionManager.runAfterInteractions(() => {
    try {
      router.push(target as never);
    } catch {
      setTimeout(() => router.push(target as never), 150);
    }
  });
}

export function setupNotificationListeners(): () => void {
  const tapSub = Notifications.addNotificationResponseReceivedListener(
    handleNotificationTap,
  );

  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (response) handleNotificationTap(response);
    })
    .catch(() => {});

  return () => {
    tapSub.remove();
  };
}
