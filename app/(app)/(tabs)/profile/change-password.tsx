import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import TextField from '@/components/forms/TextField';
import { useChangePassword } from '@/lib/hooks/useAuth';
import { showSuccessToast, showErrorToast } from '@/lib/feedback/toast';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const changePassword = useChangePassword();
  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');

  const canSubmit =
    current.length >= 1 && newPwd.length >= 8 && newPwd === confirm;

  const handleSubmit = () => {
    if (!canSubmit || changePassword.isPending) return;

    if (newPwd !== confirm) {
      showErrorToast(null, 'New passwords do not match.');
      return;
    }

    changePassword.mutate(
      { currentPassword: current, newPassword: newPwd },
      {
        onSuccess: () => {
          showSuccessToast('Password updated');
          router.back();
        },
        onError: () =>
          showErrorToast(null, 'Could not change password — double-check your current password.'),
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
          <Header title="Change Password" onBack={() => router.back()} />
        </View>

        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-8"
        >
          <View className="mb-4">
            <TextField
              label="Current Password"
              value={current}
              onChangeText={setCurrent}
              placeholder="Enter current password"
              secureTextEntry
            />
          </View>

          <View className="mb-4">
            <TextField
              label="New Password"
              value={newPwd}
              onChangeText={setNewPwd}
              placeholder="At least 8 characters"
              secureTextEntry
            />
          </View>

          <TextField
            label="Confirm New Password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Re-enter new password"
            secureTextEntry
          />

          <View className="mt-6">
            <Btn
              label={changePassword.isPending ? 'Updating...' : 'Update Password'}
              full
              onPress={handleSubmit}
              disabled={!canSubmit || changePassword.isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
