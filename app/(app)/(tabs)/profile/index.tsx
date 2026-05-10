import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ProfileSkeleton } from '@/components/feedback/SkeletonVariants';
import ErrorView from '@/components/feedback/ErrorView';
import { useProfile } from '@/lib/hooks/useProfile';
import { useLogout } from '@/lib/hooks/useAuth';
import { useColors } from '@/lib/theme/colors';
import { confirm } from '@/lib/feedback/confirm';

const MENU_ROWS = [
  { key: 'edit', icon: 'user' as const, label: 'Edit Profile' },
  { key: 'subscription', icon: 'card' as const, label: 'Subscription' },
  { key: 'payment', icon: 'card' as const, label: 'Payment Method' },
  { key: 'password', icon: 'shield' as const, label: 'Change Password' },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data: profile, isLoading, isError, error, refetch, isRefetching } = useProfile();
  const logout = useLogout();

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

  if (isLoading) return <ProfileSkeleton />;

  if (isError || !profile) {
    return <ErrorView error={error} onRetry={refetch} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-8 pt-4"
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

        <Card className="mb-4 overflow-hidden">
          {MENU_ROWS.map((row, i) => (
            <Pressable
              key={row.key}
              onPress={() => handleMenuPress(row.key)}
              className={`flex-row items-center gap-3 px-4 py-[14px] active:opacity-70 ${
                i < MENU_ROWS.length - 1
                  ? 'border-b-[0.5px] border-separator'
                  : ''
              }`}
            >
              <Icon name={row.icon} size={18} color={colors.secondary} />
              <Text className="flex-1 text-[15px] font-medium text-ink tracking-[-0.2px]">
                {row.label}
              </Text>
              <Icon name="chevron" size={16} color={colors.quaternary} />
            </Pressable>
          ))}
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
