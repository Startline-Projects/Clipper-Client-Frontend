import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import TextField from '@/components/forms/TextField';
import { useAuthStore } from '@/lib/stores/auth.store';
import { resendVerification, verifyEmail } from '@/lib/api/auth';
import { showErrorToast, showSuccessToast, showToast } from '@/lib/feedback/toast';
import { useProfile } from '@/lib/hooks/useProfile';

const RESEND_COOLDOWN_S = 60;
const CODE_LEN = 6;
const CODE_RE = /^\d{6}$/;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const email = useAuthStore((s) => s.email);
  const emailVerified = useAuthStore((s) => s.emailVerified);
  const { refetch: refetchProfile } = useProfile();

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>(undefined);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatedRef = useRef(false);

  // Leave by returning to wherever the user came from. Falls back to the app
  // home when there's nothing to go back to (e.g. we arrived here via replace()
  // straight after signup), so the back button is never a dead end.
  const leave = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/(tabs)/explore');
  }, [router]);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  useEffect(() => {
    if (emailVerified === true) leave();
  }, [emailVerified, leave]);

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

  const handleVerify = async () => {
    if (verifying) return;
    if (!email) {
      setCodeError('We could not find an email on file. Please log in again.');
      return;
    }
    const trimmed = code.trim();
    if (!CODE_RE.test(trimmed)) {
      setCodeError('Enter the 6-digit code from your email');
      return;
    }
    setVerifying(true);
    try {
      const { success } = await verifyEmail({ email, code: trimmed });
      if (!success) throw new Error('verification rejected');
      await useAuthStore.getState().setEmailVerified(true);
      showSuccessToast('Email verified.');
      void refetchProfile();
      leave();
    } catch (err) {
      setCode('');
      setCodeError('Invalid or expired code. Tap Resend to get a new one.');
      showErrorToast(err, 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || resending || secondsLeft > 0) return;
    setResending(true);
    try {
      await resendVerification({ email });
      showToast({
        variant: 'info',
        message:
          'If that address is registered, a new code is on its way.',
      });
      startCooldown();
    } catch {
      showToast({
        variant: 'error',
        message: 'Could not resend right now. Please try again shortly.',
      });
    } finally {
      setResending(false);
    }
  };

  const canSubmit = code.trim().length === CODE_LEN && !verifying;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
        >
          <Header title="Verify email" onBack={leave} />

          <View className="items-center mt-2 mb-7">
            <View className="w-[72px] h-[72px] rounded-full bg-brand-pale items-center justify-center mb-5">
              <Text className="text-[32px]">✉</Text>
            </View>
            <Text className="text-[24px] font-extrabold text-ink tracking-[-0.6px] text-center">
              Check your inbox
            </Text>
            <Text className="text-[14px] text-secondary mt-3 text-center tracking-[-0.1px] leading-[20px]">
              We sent a 6-digit code to
            </Text>
            <Text className="text-[14px] font-bold text-ink mt-1 text-center tracking-[-0.1px]">
              {email ?? 'your email address'}
            </Text>
          </View>

          <View className="mb-5">
            <TextField
              label="Verification code"
              value={code}
              onChangeText={(t) => {
                const digits = t.replace(/\D/g, '').slice(0, CODE_LEN);
                setCode(digits);
                if (codeError) setCodeError(undefined);
              }}
              placeholder="123456"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={CODE_LEN}
              returnKeyType="go"
              onSubmitEditing={handleVerify}
              error={codeError}
            />
          </View>

          <Btn
            label={verifying ? 'Verifying...' : 'Verify email'}
            full
            onPress={handleVerify}
            disabled={!canSubmit}
          />

          <View className="mt-4">
            <Btn
              label={
                secondsLeft > 0
                  ? `Resend in ${secondsLeft}s`
                  : resending
                    ? 'Sending...'
                    : 'Resend code'
              }
              variant="secondary"
              full
              onPress={handleResend}
              disabled={!email || resending || secondsLeft > 0}
            />
          </View>

          <View className="mt-6 items-center">
            <Pressable
              onPress={() => router.replace('/(app)/(tabs)/explore')}
              accessibilityRole="link"
            >
              <Text className="text-[13px] font-semibold text-tertiary">
                I'll do this later
              </Text>
            </Pressable>
          </View>

          <View className="mt-6 items-center">
            <Text className="text-[12px] text-tertiary text-center tracking-[-0.1px] leading-[18px]">
              Wrong address?{' '}
              <Pressable
                onPress={() => router.push('/(app)/(tabs)/profile/change-email')}
                accessibilityRole="link"
              >
                <Text className="text-[12px] font-bold text-ink">
                  Change email
                </Text>
              </Pressable>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
