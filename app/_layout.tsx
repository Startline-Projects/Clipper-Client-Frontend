import './global.css';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { vars } from 'nativewind';
import ToastHost from '@/components/feedback/ToastHost';
import ConfirmHost from '@/components/feedback/ConfirmHost';
import { queryClient } from '@/lib/utils/query-client';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useTheme } from '@/lib/hooks/useTheme';
import { useThemeHasHydrated } from '@/lib/stores/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function AuthRedirect() {
  const router = useRouter();
  const segments = useSegments();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasLaunched = useAuthStore((s) => s.hasLaunched);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const emailVerified = useAuthStore((s) => s.emailVerified);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuth = segments[0] === '(auth)';

    if (!accessToken && !inAuth) {
      router.replace(hasLaunched ? '/(auth)/login' : '/(auth)/welcome');
    } else if (accessToken && inAuth) {
      // Fresh signup sets emailVerified = false explicitly. Route those users
      // straight to the OTP screen so they don't have to hunt for it.
      router.replace(
        emailVerified === false
          ? '/(app)/verify-email'
          : '/(app)/(tabs)/explore'
      );
    }
  }, [accessToken, hasLaunched, isHydrated, segments, emailVerified]);

  return null;
}

const lightVars = vars({
  '--color-ink': '#0A0A0A',
  '--color-bg': '#FAF8F5',
  '--color-bg-warm': '#F5F1EC',
  '--color-bg-hover': '#F0ECE6',
  '--color-bg-muted': '#EDE9E3',
  '--color-surface': '#FFFFFF',
  '--color-card': '#FFFFFF',
  '--color-primary': '#1C1C1E',
  '--color-secondary': '#636366',
  '--color-tertiary': '#AEAEB2',
  '--color-quaternary': '#C7C7CC',
  '--color-separator': 'rgba(60,60,67,0.06)',
  '--color-separator-opaque': '#E5E5EA',
  '--color-brand': '#2563EB',
  '--color-brand-light': '#3B82F6',
  '--color-brand-pale': '#EFF6FF',
  '--color-brand-accent': '#1D4ED8',
});

const darkVars = vars({
  '--color-ink': '#F5F5F7',
  '--color-bg': '#000000',
  '--color-bg-warm': '#1C1C1E',
  '--color-bg-hover': '#2C2C2E',
  '--color-bg-muted': '#38383A',
  '--color-surface': '#1C1C1E',
  '--color-card': '#2C2C2E',
  '--color-primary': '#F5F5F7',
  '--color-secondary': '#AEAEB2',
  '--color-tertiary': '#636366',
  '--color-quaternary': '#48484A',
  '--color-separator': 'rgba(255,255,255,0.08)',
  '--color-separator-opaque': '#38383A',
  '--color-brand': '#3B82F6',
  '--color-brand-light': '#60A5FA',
  '--color-brand-pale': '#1E3A5F',
  '--color-brand-accent': '#2563EB',
});

function RootInner() {
  const theme = useTheme();

  return (
    <View style={[{ flex: 1 }, theme === 'dark' ? darkVars : lightVars]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <AuthRedirect />
      <Slot />
      <ToastHost />
      <ConfirmHost />
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
    <SafeAreaProvider>
      <GestureHandlerRootView className="flex-1">
        <QueryClientProvider client={queryClient}>
          <RootInner />
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
