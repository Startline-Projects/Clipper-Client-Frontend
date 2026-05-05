import './global.css';
import { useEffect } from 'react';
import { Appearance, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { StripeProvider } from '@stripe/stripe-react-native';
import { queryClient } from '@/lib/utils/query-client';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useTheme } from '@/lib/hooks/useTheme';
import { useThemeHasHydrated } from '@/lib/stores/theme';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/utils/stripe';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function AuthRedirect() {
  const router = useRouter();
  const segments = useSegments();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasLaunched = useAuthStore((s) => s.hasLaunched);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuth = segments[0] === '(auth)';

    if (!accessToken && !inAuth) {
      router.replace(hasLaunched ? '/(auth)/login' : '/(auth)/welcome');
    } else if (accessToken && inAuth) {
      router.replace('/(app)/(tabs)/home');
    }
  }, [accessToken, hasLaunched, isHydrated, segments]);

  return null;
}

function RootInner() {
  const theme = useTheme();

  useEffect(() => {
    Appearance.setColorScheme(theme);
  }, [theme]);

  return (
    <View className="flex-1 bg-bg">
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <AuthRedirect />
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const themeHydrated = useThemeHasHydrated();

  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (isHydrated && themeHydrated) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated, themeHydrated]);

  if (!isHydrated || !themeHydrated) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <RootInner />
        </StripeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
