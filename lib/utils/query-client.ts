import {
  QueryClient,
  QueryCache,
  MutationCache,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { showErrorToast } from '@/lib/feedback/toast';
import type { ApiError } from '@/lib/api/client';

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: { silent?: boolean };
    mutationMeta: { silent?: boolean };
  }
}

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

function isSessionExpired(error: unknown): boolean {
  return (error as Partial<ApiError>)?.sessionExpired === true;
}

const qCache = new QueryCache({
  onError: (error, query) => {
    if (isSessionExpired(error)) return;
    if (query.state.data !== undefined && query.meta?.silent !== true) {
      showErrorToast(error);
    }
  },
});

const mCache = new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    if (isSessionExpired(error)) return;
    if (mutation.meta?.silent !== true) {
      showErrorToast(error);
    }
  },
});

export const queryClient = new QueryClient({
  queryCache: qCache,
  mutationCache: mCache,
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
