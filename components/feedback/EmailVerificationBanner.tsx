import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { resendVerification } from '@/lib/api/auth';
import { showToast } from '@/lib/feedback/toast';

const RESEND_COOLDOWN_S = 60;

interface Props {
  className?: string;
}

export default function EmailVerificationBanner({ className }: Props) {
  const router = useRouter();
  const emailVerified = useAuthStore((s) => s.emailVerified);
  const email = useAuthStore((s) => s.email);

  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cooldown]);

  if (emailVerified !== false) return null;
  if (!email) return null;

  const handleResend = async () => {
    if (cooldown > 0 || sending) return;
    setSending(true);
    try {
      await resendVerification({ email });
      showToast({
        variant: 'info',
        message:
          'If that address is registered, a new verification email has been sent.',
      });
      setCooldown(RESEND_COOLDOWN_S);
    } catch {
      showToast({
        variant: 'error',
        message: 'Could not resend right now. Please try again shortly.',
      });
    } finally {
      setSending(false);
    }
  };

  const mm = Math.floor(cooldown / 60);
  const ss = String(cooldown % 60).padStart(2, '0');
  const resendLabel =
    cooldown > 0
      ? `Resend in ${mm}:${ss}`
      : sending
        ? 'Sending…'
        : 'Resend email';

  return (
    <Pressable
      onPress={() => router.push('/(app)/verify-email')}
      accessibilityRole="button"
      accessibilityLabel="Confirm your email"
      className={`flex-row items-start gap-3 mx-4 mt-3 px-4 py-3 rounded-md bg-brand-pale border border-brand/20 ${className ?? ''}`}
    >
      <View className="mt-[1px]">
        <Text className="text-[16px]">✉</Text>
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-semibold text-ink tracking-[-0.1px]">
          Confirm your email
        </Text>
        <Text className="text-[12px] text-secondary mt-[2px] tracking-[-0.1px]">
          We sent a 6-digit code to {email}. Tap to enter it now.
        </Text>
        <Pressable
          onPress={handleResend}
          disabled={cooldown > 0 || sending}
          accessibilityRole="button"
          hitSlop={8}
          className="mt-2 self-start"
        >
          <Text
            className={`text-[12px] font-semibold ${
              cooldown > 0 || sending ? 'text-tertiary' : 'text-brand'
            }`}
          >
            {resendLabel}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
