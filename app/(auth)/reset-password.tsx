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
import ErrorView from '@/components/feedback/ErrorView';
import SuccessView from '@/components/feedback/SuccessView';
import { useColors } from '@/lib/theme/colors';
import { useResetPassword } from '@/lib/hooks/useAuth';
import { confirm as showConfirmDialog } from '@/lib/feedback/confirm';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const colors = useColors();
  const { token } = useLocalSearchParams<{ token: string }>();
  const reset = useResetPassword();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const confirmRef = useRef<TextInput>(null);

  if (!token) {
    return (
      <ErrorView
        title="Invalid reset link"
        message="This link is invalid or has expired. Please request a new password reset."
        icon="shield"
        primaryCta={{ label: 'Request new link', onPress: () => router.replace('/(auth)/forgot-password') }}
      />
    );
  }

  const validate = () => {
    const e: typeof errors = {};
    if (!password) e.password = 'Password is required';
    else if (password.length < MIN_PASSWORD_LENGTH)
      e.password = `Must be at least ${MIN_PASSWORD_LENGTH} characters`;
    if (!confirm) e.confirm = 'Please confirm your password';
    else if (confirm !== password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canSubmit =
    password.length >= MIN_PASSWORD_LENGTH && confirm.length > 0;

  const handleReset = () => {
    if (reset.isPending) return;
    if (!validate()) return;
    reset.mutate(
      { token, newPassword: password },
      {
        onSuccess: () => setSuccess(true),
        onError: async () => {
          const yes = await showConfirmDialog({
            title: 'Reset failed',
            message: 'This link may have expired or already been used.',
            confirmLabel: 'Request new link',
            cancelLabel: 'Cancel',
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
        primaryCta={{ label: 'Back to login', onPress: () => router.replace('/(auth)/login') }}
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
            Choose a new password. Must be at least {MIN_PASSWORD_LENGTH}{' '}
            characters.
          </Text>

          <View className="mb-4">
            <TextField
              label="New Password"
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
              label="Confirm Password"
              value={confirm}
              onChangeText={(t) => {
                setConfirm(t);
                if (errors.confirm)
                  setErrors((e) => ({ ...e, confirm: undefined }));
              }}
              placeholder="Re-enter password"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={handleReset}
              error={errors.confirm}
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
