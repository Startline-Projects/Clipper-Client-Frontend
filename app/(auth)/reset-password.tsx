import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import TextField from '@/components/forms/TextField';
import SuccessView from '@/components/feedback/SuccessView';
import { useResetPassword } from '@/lib/hooks/useAuth';
import { confirm as showConfirmDialog } from '@/lib/feedback/confirm';

const MIN_PASSWORD_LENGTH = 8;
const CODE_LEN = 6;
const CODE_RE = /^\d{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const reset = useResetPassword();

  const [email, setEmail] = useState(emailParam ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    code?: string;
    password?: string;
    confirmPwd?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  const codeRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const validate = () => {
    const e: typeof errors = {};
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();
    if (!trimmedEmail) e.email = 'Email is required';
    else if (!EMAIL_RE.test(trimmedEmail))
      e.email = 'Enter a valid email address';
    if (!trimmedCode) e.code = 'Code is required';
    else if (!CODE_RE.test(trimmedCode)) e.code = 'Enter the 6-digit code';
    if (!password) e.password = 'Password is required';
    else if (password.length < MIN_PASSWORD_LENGTH)
      e.password = `Must be at least ${MIN_PASSWORD_LENGTH} characters`;
    if (!confirmPwd) e.confirmPwd = 'Please confirm your password';
    else if (confirmPwd !== password) e.confirmPwd = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canSubmit =
    email.trim().length > 0 &&
    code.trim().length === CODE_LEN &&
    password.length >= MIN_PASSWORD_LENGTH &&
    confirmPwd.length > 0;

  const handleReset = () => {
    if (reset.isPending) return;
    if (!validate()) return;
    reset.mutate(
      {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword: password,
      },
      {
        onSuccess: () => setSuccess(true),
        onError: async () => {
          const yes = await showConfirmDialog({
            title: 'Reset failed',
            message:
              'The code may have expired or is incorrect. Request a new one?',
            confirmLabel: 'Request new code',
            cancelLabel: 'Try again',
          });
          if (yes) router.replace('/(auth)/forgot-password');
        },
      },
    );
  };

  if (success) {
    return (
      <SuccessView
        title="Password updated"
        message="Your password has been changed. Log in with your new password."
        primaryCta={{
          label: 'Back to login',
          onPress: () => router.replace('/(auth)/login'),
        }}
      />
    );
  }

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
          <Header title="New password" onBack={() => router.back()} />

          <Text className="text-[14px] text-secondary leading-[20px] tracking-[-0.1px] mt-1 mb-6">
            Enter the 6-digit code we sent to your email and choose a new
            password.
          </Text>

          <View className="mb-4">
            <TextField
              label="Email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email)
                  setErrors((e) => ({ ...e, email: undefined }));
              }}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => codeRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.email}
            />
          </View>

          <View className="mb-4">
            <TextField
              ref={codeRef}
              label="Verification code"
              value={code}
              onChangeText={(t) => {
                const digits = t.replace(/\D/g, '').slice(0, CODE_LEN);
                setCode(digits);
                if (errors.code)
                  setErrors((e) => ({ ...e, code: undefined }));
              }}
              placeholder="123456"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={CODE_LEN}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.code}
            />
          </View>

          <View className="mb-4">
            <TextField
              ref={passwordRef}
              label="New password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password)
                  setErrors((e) => ({ ...e, password: undefined }));
              }}
              placeholder="Min 8 characters"
              secureTextEntry={!showPw}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.password}
              right={
                <Pressable
                  onPress={() => setShowPw((p) => !p)}
                  accessibilityLabel={
                    showPw ? 'Hide password' : 'Show password'
                  }
                  accessibilityRole="button"
                >
                  <Text className="text-[12px] font-semibold text-tertiary">
                    {showPw ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              }
            />
          </View>

          <View className="mb-6">
            <TextField
              ref={confirmRef}
              label="Confirm password"
              value={confirmPwd}
              onChangeText={(t) => {
                setConfirmPwd(t);
                if (errors.confirmPwd)
                  setErrors((e) => ({ ...e, confirmPwd: undefined }));
              }}
              placeholder="Re-enter password"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={handleReset}
              error={errors.confirmPwd}
              right={
                <Pressable
                  onPress={() => setShowConfirm((p) => !p)}
                  accessibilityLabel={
                    showConfirm ? 'Hide password' : 'Show password'
                  }
                  accessibilityRole="button"
                >
                  <Text className="text-[12px] font-semibold text-tertiary">
                    {showConfirm ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              }
            />
          </View>

          <Btn
            label={reset.isPending ? 'Resetting...' : 'Reset password'}
            full
            onPress={handleReset}
            disabled={!canSubmit || reset.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
