import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import {
  installSubscriptionGate,
  uninstallSubscriptionGate,
} from '@/lib/utils/subscription-gate';

export function useSubscriptionGate() {
  const hasTokens = useAuthStore((s) => Boolean(s.accessToken));

  useEffect(() => {
    if (hasTokens) {
      installSubscriptionGate();
    } else {
      uninstallSubscriptionGate();
    }
    return () => uninstallSubscriptionGate();
  }, [hasTokens]);
}
