import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import type { ApiError } from '@/lib/api/client';

const STALE_TIME = 2 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      retry: (failureCount, error) => {
        const apiError = error as Partial<ApiError>;
        if (
          typeof apiError?.status === 'number' &&
          apiError.status >= 400 &&
          apiError.status < 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener('change', (status) => {
    if (Platform.OS !== 'web') handleFocus(status === 'active');
  });
  return () => sub.remove();
});

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});
