import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import TextField from '@/components/forms/TextField';
import { useChangeEmail } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { showErrorToast, showSuccessToast } from '@/lib/feedback/toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function ChangeEmailScreen() {
  const router = useRouter();
  const changeEmail = useChangeEmail();
  const currentEmail = useAuthStore((s) => s.email);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newEmail?: string;
    confirmEmail?: string;
  }>({});

  const newEmailRef = useRef<TextInput>(null);
  const confirmEmailRef = useRef<TextInput>(null);

  const validate = () => {
    const e: typeof errors = {};
    if (!currentPassword) e.currentPassword = 'Current password is required';
    else if (currentPassword.length < MIN_PASSWORD_LENGTH)
      e.currentPassword = `Must be at least ${MIN_PASSWORD_LENGTH} characters`;
    const trimmedNew = newEmail.trim().toLowerCase();
    const trimmedConfirm = confirmEmail.trim().toLowerCase();
    if (!trimmedNew) e.newEmail = 'New email is required';
    else if (!EMAIL_RE.test(trimmedNew))
      e.newEmail = 'Enter a valid email address';
    else if (currentEmail && trimmedNew === currentEmail.toLowerCase())
      e.newEmail = 'New email must differ from the current one';
    if (!trimmedConfirm) e.confirmEmail = 'Please re-enter the new email';
    else if (trimmedConfirm !== trimmedNew)
      e.confirmEmail = 'Emails do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canSubmit =
    currentPassword.length > 0 &&
    newEmail.trim().length > 0 &&
    confirmEmail.trim().length > 0;

  const handleSubmit = () => {
    if (changeEmail.isPending) return;
    if (!validate()) return;
    changeEmail.mutate(
      {
        currentPassword,
        newEmail: newEmail.trim().toLowerCase(),
      },
      {
        onSuccess: () => {
          showSuccessToast('Email updated. Check your inbox for the new code.');
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(app)/(tabs)/profile');
          }
        },
        onError: (err: any) => {
          const msg: string = err?.message ?? '';
          if (/already.*use|in use|registered|taken/i.test(msg)) {
            setErrors((e) => ({ ...e, newEmail: 'This email is already in use' }));
          } else if (/current password|invalid/i.test(msg)) {
            setErrors((e) => ({
              ...e,
              currentPassword: 'Current password is incorrect',
            }));
          } else {
            showErrorToast(err, 'Could not change email. Please try again.');
          }
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="px-5">
          <Header title="Change Email" onBack={() => router.back()} />
        </View>

        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-8"
        >
          <Text className="text-[14px] text-secondary leading-[20px] tracking-[-0.1px] mb-2">
            Your current email
          </Text>
          <Text className="text-[15px] font-semibold text-ink tracking-[-0.2px] mb-6">
            {currentEmail ?? '—'}
          </Text>

          <View className="mb-4">
            <TextField
              label="Current password"
              value={currentPassword}
              onChangeText={(t) => {
                setCurrentPassword(t);
                if (errors.currentPassword)
                  setErrors((e) => ({ ...e, currentPassword: undefined }));
              }}
              placeholder="Enter current password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => newEmailRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.currentPassword}
            />
          </View>

          <View className="mb-4">
            <TextField
              ref={newEmailRef}
              label="New email"
              value={newEmail}
              onChangeText={(t) => {
                setNewEmail(t);
                if (errors.newEmail)
                  setErrors((e) => ({ ...e, newEmail: undefined }));
              }}
              placeholder="new.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => confirmEmailRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.newEmail}
            />
          </View>

          <View className="mb-2">
            <TextField
              ref={confirmEmailRef}
              label="Confirm new email"
              value={confirmEmail}
              onChangeText={(t) => {
                setConfirmEmail(t);
                if (errors.confirmEmail)
                  setErrors((e) => ({ ...e, confirmEmail: undefined }));
              }}
              placeholder="Re-enter the new email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              error={errors.confirmEmail}
            />
          </View>

          <Text className="text-[12px] text-tertiary leading-[18px] tracking-[-0.1px] mt-3 mb-5">
            We'll send a 6-digit code to your new address. You'll need to enter
            it to finish verification.
          </Text>

          <Btn
            label={changeEmail.isPending ? 'Updating...' : 'Update email'}
            full
            onPress={handleSubmit}
            disabled={!canSubmit || changeEmail.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
