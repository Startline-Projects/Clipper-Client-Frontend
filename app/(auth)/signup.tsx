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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import TextField from '@/components/forms/TextField';
import { useRegister } from '@/lib/hooks/useAuth';
import { showErrorToast } from '@/lib/feedback/toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
const NAME_RE = /^[a-zA-ZÀ-ɏЀ-ӿ؀-ۿ\s'\-\.]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function SignupScreen() {
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const validate = () => {
    const e: typeof errors = {};
    const trimmedName = name.trim();
    const trimmedUser = username.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) e.name = 'Name is required';
    else if (trimmedName.length < 2) e.name = 'Must be at least 2 characters';
    else if (!NAME_RE.test(trimmedName))
      e.name = 'Letters, spaces, hyphens, and apostrophes only';
    if (!trimmedUser) e.username = 'Username is required';
    else if (trimmedUser.length < 3)
      e.username = 'Must be at least 3 characters';
    else if (trimmedUser.length > 30)
      e.username = 'Must be 30 characters or fewer';
    else if (!USERNAME_RE.test(trimmedUser))
      e.username = 'Letters, numbers, and underscores only';
    if (!trimmedEmail) e.email = 'Email is required';
    else if (!EMAIL_RE.test(trimmedEmail))
      e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < MIN_PASSWORD_LENGTH)
      e.password = `Must be at least ${MIN_PASSWORD_LENGTH} characters`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canSubmit =
    name.trim().length > 0 &&
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0;

  const handleSignup = () => {
    if (register.isPending) return;
    if (!validate()) return;
    register.mutate(
      {
        name: name.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      },
      {
        onError: (err: any) => {
          const msg: string =
            err?.message ?? 'Something went wrong. Try again.';
          if (/email.*already|already.*registered/i.test(msg)) {
            setErrors((e) => ({ ...e, email: 'This email is already registered' }));
          } else if (/username.*taken|username.*already/i.test(msg)) {
            setErrors((e) => ({ ...e, username: 'This username is already taken' }));
          } else {
            showErrorToast(null, msg);
          }
        },
      },
    );
  };

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
          <Header title="" onBack={() => router.back()} />

          <View className="items-center mt-2 mb-7">
            <Text className="text-[26px] font-extrabold text-ink tracking-[-0.6px]">
              Create your account
            </Text>
            <Text className="text-[14px] text-tertiary mt-2 tracking-[-0.1px]">
              Start booking your favourite barbers
            </Text>
          </View>

          <View className="mb-4">
            <TextField
              label="Full Name"
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (errors.name)
                  setErrors((e) => ({ ...e, name: undefined }));
              }}
              placeholder="John Doe"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => usernameRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.name}
            />
          </View>

          <View className="mb-4">
            <TextField
              ref={usernameRef}
              label="Username"
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                if (errors.username)
                  setErrors((e) => ({ ...e, username: undefined }));
              }}
              placeholder="johndoe"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.username}
            />
          </View>

          <View className="mb-4">
            <TextField
              ref={emailRef}
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
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              error={errors.email}
            />
          </View>

          <View className="mb-0">
            <TextField
              ref={passwordRef}
              label="Password"
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
              returnKeyType="go"
              onSubmitEditing={handleSignup}
              error={errors.password}
              right={
                <Pressable
                  onPress={() => setShowPw((p) => !p)}
                  accessibilityLabel={
                    showPw ? 'Hide password' : 'Show password'
                  }
                  accessibilityRole="button"
                >
                  <Text className="text-[12px] font-semibold text-tertiary tracking-[-0.1px]">
                    {showPw ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              }
            />
          </View>

          <View className="mt-6">
            <Btn
              label={register.isPending ? 'Creating account...' : 'Sign Up'}
              full
              onPress={handleSignup}
              disabled={!canSubmit || register.isPending}
            />
          </View>

          <View className="flex-row justify-center mt-7 mb-8">
            <Text className="text-[13px] text-secondary tracking-[-0.1px]">
              Already have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text className="text-[13px] font-bold text-ink">Log in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
