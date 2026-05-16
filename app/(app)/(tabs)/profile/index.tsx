import { useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ProfileSkeleton } from '@/components/feedback/SkeletonVariants';
import ErrorView from '@/components/feedback/ErrorView';
import { useProfile } from '@/lib/hooks/useProfile';
import { useClientNoShows } from '@/lib/hooks/useNoShows';
import { useLogout } from '@/lib/hooks/useAuth';
import { formatCurrency } from '@/lib/utils/format';
import { useAuthStore, useIsAuthenticated } from '@/lib/stores/auth.store';
import { useColors } from '@/lib/theme/colors';
import { confirm } from '@/lib/feedback/confirm';
import { resendVerification } from '@/lib/api/auth';

const MENU_ROWS = [
  { key: 'edit', icon: 'user' as const, label: 'Edit Profile' },
  { key: 'subscription', icon: 'card' as const, label: 'Subscription' },
  { key: 'payment', icon: 'card' as const, label: 'Payment Method' },
  { key: 'noShows', icon: 'alert' as const, label: 'No-Show Payments' },
  { key: 'verifyEmail', icon: 'shield' as const, label: 'Verify Email' },
  { key: 'password', icon: 'shield' as const, label: 'Change Password' },
] as const;

const OWING_STATUSES = new Set(['unresolved', 'failed', 'pending_payment']);

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const isAuthenticated = useIsAuthenticated();
  const { data: profile, isLoading, isError, error, refetch, isRefetching } = useProfile();
  const { data: noShows } = useClientNoShows();
  const logout = useLogout();
  const email = useAuthStore((s) => s.email);
  const emailVerified = useAuthStore((s) => s.emailVerified);
  const [resending, setResending] = useState(false);

  const owedNoShows = (noShows?.items ?? []).filter((i) => OWING_STATUSES.has(i.status));
  const owedCount = owedNoShows.length;
  const owedAmount = owedNoShows.reduce((s, i) => s + i.amountUsd, 0);
  const hasBlocked = owedCount >= 3;

  const handleVerifyEmail = async () => {
    if (emailVerified === true) {
      Alert.alert('Email verified', 'Your email is already verified.');
      return;
    }
    const target = email ?? profile?.email;
    if (!target) {
      Alert.alert('Missing email', 'No email on file for this account.');
      return;
    }
    try {
      setResending(true);
      await resendVerification({ email: target });
      Alert.alert(
        'Verification email sent',
        `We sent a verification link to ${target}. Tap it to verify your address.`,
      );
    } catch (e) {
      const msg = (e as Error)?.message ?? 'Please try again.';
      Alert.alert('Could not send', msg);
    } finally {
      setResending(false);
    }
  };

  const handleMenuPress = (key: string) => {
    switch (key) {
      case 'edit':
        router.push('/(app)/(tabs)/profile/edit');
        break;
      case 'subscription':
        router.push('/(app)/(tabs)/profile/subscription');
        break;
      case 'payment':
        router.push('/(app)/(tabs)/profile/payment-method');
        break;
      case 'noShows':
        router.push('/(app)/(tabs)/profile/no-shows');
        break;
      case 'verifyEmail':
        void handleVerifyEmail();
        break;
      case 'password':
        router.push('/(app)/(tabs)/profile/change-password');
        break;
    }
  };

  const handleLogout = async () => {
    const yes = await confirm({
      title: 'Log out?',
      message: 'You can sign back in any time.',
      confirmLabel: 'Log Out',
      destructive: true,
    });
    if (yes) logout.mutate();
  };

  if (isLoading || !isAuthenticated) return <ProfileSkeleton />;

  if (isError || !profile) {
    if ((error as Record<string, unknown>)?.sessionExpired) return <ProfileSkeleton />;
    return <ErrorView error={error} onRetry={refetch} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-8 pt-2"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View className="items-center mb-6">
          <Avatar
            name={profile.name}
            size={80}
            uri={profile.profilePhotoUrl ?? undefined}
          />
          <Text className="text-[20px] font-bold text-ink tracking-[-0.3px] mt-3">
            {profile.name}
          </Text>
          {profile.username && (
            <Text className="text-[14px] text-secondary mt-[2px]">
              @{profile.username}
            </Text>
          )}
        </View>

        {owedCount > 0 && (
          <Pressable
            onPress={() => router.push('/(app)/(tabs)/profile/no-shows')}
            accessibilityRole="button"
            accessibilityLabel="Resolve no-show payments"
          >
            <Card
              className="mb-4 p-4 border-0"
              style={{
                backgroundColor: colors.red + '12',
                borderLeftWidth: 3,
                borderLeftColor: colors.red,
              }}
            >
              <View className="flex-row items-start gap-2">
                <Icon name="alert" size={18} color={colors.red} />
                <View className="flex-1">
                  <Text className="text-[14px] font-semibold" style={{ color: colors.red }}>
                    {hasBlocked
                      ? 'Bookings on hold — pay your no-show fees'
                      : `${owedCount} unpaid no-show${owedCount === 1 ? '' : 's'} · ${formatCurrency(owedAmount)}`}
                  </Text>
                  <Text className="text-[12px] text-secondary mt-[2px] leading-[17px]">
                    {hasBlocked
                      ? 'You have 3+ unresolved no-show fees. Some barbers may block new bookings until resolved.'
                      : 'Tap to settle your outstanding no-show fees.'}
                  </Text>
                </View>
                <Icon name="chevron" size={16} color={colors.red} />
              </View>
            </Card>
          </Pressable>
        )}

        <Card className="mb-4 overflow-hidden">
          {MENU_ROWS.map((row, i) => {
            const isNoShows = row.key === 'noShows';
            const isVerify = row.key === 'verifyEmail';
            const showBadge = isNoShows && owedCount > 0;
            const verified = isVerify && emailVerified === true;
            const verifyPending = isVerify && resending;
            return (
              <Pressable
                key={row.key}
                onPress={() => handleMenuPress(row.key)}
                disabled={verifyPending}
                className={`flex-row items-center gap-3 px-4 py-[14px] active:opacity-70 ${
                  i < MENU_ROWS.length - 1
                    ? 'border-b-[0.5px] border-separator'
                    : ''
                }`}
                accessibilityRole="button"
                accessibilityLabel={row.label}
              >
                <Icon
                  name={row.icon}
                  size={18}
                  color={showBadge ? colors.red : colors.secondary}
                />
                <Text className="flex-1 text-[15px] font-medium text-ink tracking-[-0.2px]">
                  {row.label}
                </Text>
                {showBadge && (
                  <View
                    className="px-[8px] py-[2px] rounded-full"
                    style={{ backgroundColor: colors.red }}
                  >
                    <Text className="text-[11px] font-bold text-white">{owedCount}</Text>
                  </View>
                )}
                {isVerify && (
                  <Text
                    className="text-[12px] font-semibold mr-1"
                    style={{ color: verified ? colors.secondary : colors.tertiary }}
                  >
                    {verifyPending ? 'Sending…' : verified ? 'Verified' : 'Not verified'}
                  </Text>
                )}
                <Icon name="chevron" size={16} color={colors.quaternary} />
              </Pressable>
            );
          })}
        </Card>

        <Card className="mb-4 px-4">
          <Text className="text-[13px] font-semibold text-secondary uppercase tracking-[0.5px] pt-3 pb-1">
            Appearance
          </Text>
          <ThemeToggle />
        </Card>

        <Pressable
          onPress={handleLogout}
          disabled={logout.isPending}
          className="flex-row items-center justify-center gap-2 py-4 mt-2 active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Icon name="logout" size={18} color={colors.red} />
          <Text className="text-[15px] font-semibold text-red">
            {logout.isPending ? 'Logging out...' : 'Log Out'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
