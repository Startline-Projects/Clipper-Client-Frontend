import { useState } from 'react';
import {
  Alert,
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
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }

    changePassword.mutate(
      { currentPassword: current, newPassword: newPwd },
      {
        onSuccess: () => {
          Alert.alert('Password Changed', 'Your password has been updated.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: () =>
          Alert.alert('Failed', 'Could not change password. Check your current password.'),
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
          <TextField
            label="Current Password"
            value={current}
            onChangeText={setCurrent}
            placeholder="Enter current password"
            secureTextEntry
          />

          <View className="h-4" />

          <TextField
            label="New Password"
            value={newPwd}
            onChangeText={setNewPwd}
            placeholder="At least 8 characters"
            secureTextEntry
          />

          <View className="h-4" />

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
