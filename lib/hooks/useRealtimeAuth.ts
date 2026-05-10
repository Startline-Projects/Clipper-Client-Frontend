import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { setRealtimeAuth } from '@/lib/utils/supabase-client';

export function useRealtimeAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    setRealtimeAuth(accessToken);
  }, [accessToken]);
}
