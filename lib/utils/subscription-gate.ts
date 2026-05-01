import { router } from 'expo-router';
import { apiClient, ApiError } from '@/lib/api/client';

const PAYWALL_ROUTE = '/paywall' as const;
const REDIRECT_COOLDOWN_MS = 500;

let interceptorId: number | null = null;
let isRedirecting = false;

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'code' in error
  );
}

export function installSubscriptionGate() {
  if (interceptorId !== null) return;

  interceptorId = apiClient.interceptors.response.use(
    undefined,
    (error: unknown) => {
      if (
        isApiError(error) &&
        error.status === 403 &&
        error.code === 'SUBSCRIPTION_REQUIRED' &&
        !isRedirecting
      ) {
        isRedirecting = true;
        // replace (not push) so the user can't swipe back into the gated screen
        // and re-trigger the 403 in a loop.
        router.replace(PAYWALL_ROUTE);
        setTimeout(() => {
          isRedirecting = false;
        }, REDIRECT_COOLDOWN_MS);
      }
      return Promise.reject(error);
    },
  );
}

export function uninstallSubscriptionGate() {
  if (interceptorId === null) return;
  apiClient.interceptors.response.eject(interceptorId);
  interceptorId = null;
  isRedirecting = false;
}
