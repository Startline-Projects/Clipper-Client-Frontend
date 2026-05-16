import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Btn from '@/components/ui/Btn';
import { useAuthStore } from '@/lib/stores/auth.store';
import { resendVerification } from '@/lib/api/auth';
import { showToast } from '@/lib/feedback/toast';

const RESEND_COOLDOWN_S = 60;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const email = useAuthStore((s) => s.email);
  const emailVerified = useAuthStore((s) => s.emailVerified);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sending, setSending] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const startCooldown = () => {
    setSecondsLeft(RESEND_COOLDOWN_S);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1 && tickRef.current) {
          clearInterval(tickRef.current);
          tickRef.current = null;
        }
        return Math.max(0, s - 1);
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (!email || sending || secondsLeft > 0) return;
    setSending(true);
    try {
      await resendVerification({ email });
      showToast({
        variant: 'info',
        message:
          'If that address is registered, a new verification email has been sent.',
      });
      startCooldown();
    } catch {
      showToast({
        variant: 'error',
        message: 'Could not resend right now. Please try again shortly.',
      });
    } finally {
      setSending(false);
    }
  };

  const handleOpenMail = async () => {
    const url = Platform.OS === 'ios' ? 'message://' : 'mailto:';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else await Linking.openURL('mailto:');
    } catch {
      // ignore
    }
  };

  const handleContinue = () => {
    router.replace('/(app)/(tabs)/explore');
  };

  useEffect(() => {
    if (emailVerified) {
      router.replace('/(app)/(tabs)/explore');
    }
  }, [emailVerified, router]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 px-5 pt-6">
        <View className="items-center mt-4 mb-8">
          <View className="w-[72px] h-[72px] rounded-full bg-brand-pale items-center justify-center mb-5">
            <Text className="text-[32px]">✉</Text>
          </View>
          <Text className="text-[24px] font-extrabold text-ink tracking-[-0.6px] text-center">
            Check your inbox
          </Text>
          <Text className="text-[14px] text-secondary mt-3 text-center tracking-[-0.1px] leading-[20px]">
            We sent a confirmation link to
          </Text>
          <Text className="text-[14px] font-bold text-ink mt-1 text-center tracking-[-0.1px]">
            {email ?? 'your email address'}
          </Text>
          <Text className="text-[13px] text-tertiary mt-4 text-center tracking-[-0.1px] leading-[18px] px-2">
            Tap the link to verify your email. You can keep using Clipper while
            you wait — some features may ask you to verify first.
          </Text>
        </View>

        <View className="gap-3">
          <Btn label="Open mail app" onPress={handleOpenMail} />
          <Btn
            label={
              secondsLeft > 0
                ? `Resend in ${secondsLeft}s`
                : sending
                  ? 'Sending...'
                  : 'Resend email'
            }
            variant="secondary"
            full
            onPress={handleResend}
            disabled={!email || sending || secondsLeft > 0}
          />
          <Btn
            label="Continue to app"
            variant="ghost"
            full
            onPress={handleContinue}
          />
        </View>

        <View className="mt-8 items-center">
          <Text className="text-[12px] text-tertiary text-center tracking-[-0.1px] leading-[18px]">
            Wrong address?{' '}
            <Pressable
              onPress={async () => {
                await useAuthStore.getState().logout();
                router.replace('/(auth)/signup');
              }}
              accessibilityRole="link"
            >
              <Text className="text-[12px] font-bold text-ink">
                Sign up again
              </Text>
            </Pressable>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
