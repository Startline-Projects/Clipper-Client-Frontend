import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { verifyEmail, resendVerification } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { showToast, showSuccessToast } from '@/lib/feedback/toast';
import { isApiError } from '@/lib/api/error-map';

const RESEND_COOLDOWN_MS = 60_000;

async function handleVerifyUrl(url: string, lastResendAtRef: { current: number }) {
  const parsed = Linking.parse(url);
  const path = (parsed.path ?? '').replace(/^\/+/, '');
  if (path !== 'auth/confirm') return;

  const tokenHash = parsed.queryParams?.token_hash;
  if (typeof tokenHash !== 'string' || !tokenHash) return;

  try {
    const { success } = await verifyEmail({ token: tokenHash, type: 'signup' });
    if (!success) throw { status: 401, message: 'Verification failed', code: 'EMAIL_VERIFY_FAILED', isNetwork: false, isTimeout: false };
    showSuccessToast('Your email has been verified.');
    await useAuthStore.getState().setEmailVerified(true);
  } catch (err) {
    const invalid = isApiError(err) && (err.status === 401 || err.code === 'EMAIL_VERIFY_FAILED');
    const email = useAuthStore.getState().user?.email;
    showToast({
      variant: 'error',
      title: invalid ? 'Verification failed' : 'Something went wrong',
      message: invalid
        ? 'This verification link is invalid or has expired.'
        : 'Please try again in a moment.',
      action: email
        ? {
            label: 'Resend',
            onPress: async () => {
              const now = Date.now();
              if (now - lastResendAtRef.current < RESEND_COOLDOWN_MS) {
                showToast({
                  variant: 'info',
                  message: 'Please wait before requesting another email.',
                });
                return;
              }
              lastResendAtRef.current = now;
              try {
                await resendVerification({ email });
                showToast({
                  variant: 'info',
                  message:
                    'If that address is registered, a new verification email has been sent.',
                });
              } catch {
                // Endpoint is no-op on failure per spec; swallow.
              }
            },
          }
        : undefined,
    });
  }
}

export function useEmailVerifyDeepLink() {
  const lastResendAt = useRef(0);

  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {
        if (url) handleVerifyUrl(url, lastResendAt);
      })
      .catch(() => {});

    const sub = Linking.addEventListener('url', ({ url }) => {
      handleVerifyUrl(url, lastResendAt);
    });

    return () => sub.remove();
  }, []);
}
