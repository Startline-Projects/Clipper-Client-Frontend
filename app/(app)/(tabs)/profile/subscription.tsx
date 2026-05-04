import { Alert, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import {
  useSubscription,
  useSwitchPlan,
  useCancelSubscription,
  useReplacePaymentMethod,
} from '@/lib/hooks/useSubscription';
import { useColors } from '@/lib/theme/colors';
import { formatDate } from '@/lib/utils/format';
import { collectPaymentMethod } from '@/lib/utils/stripe';

export default function SubscriptionScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data: sub, isLoading } = useSubscription();
  const switchPlan = useSwitchPlan();
  const cancelSub = useCancelSubscription();
  const replaceCard = useReplacePaymentMethod();

  if (isLoading || !sub) return <LoadingSpinner />;

  const isActive = sub.status === 'active';
  const isInactive = sub.status === 'inactive';
  const isPastDue = sub.status === 'past_due';

  const handleCancel = () => {
    Alert.alert(
      'Cancel Subscription',
      'You will keep access until the end of your billing period.',
      [
        { text: 'Keep Plan', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () =>
            cancelSub.mutate(undefined, {
              onError: () =>
                Alert.alert('Failed', 'Could not cancel. Try again.'),
            }),
        },
      ],
    );
  };

  const handleSwitchToYearly = () => {
    Alert.alert(
      'Switch to Yearly',
      'You\'ll be switched to $9.99/year (save 17%). Change takes effect at next billing cycle.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () =>
            switchPlan.mutate(undefined, {
              onSuccess: () =>
                Alert.alert('Switched', 'Plan changed to yearly.'),
              onError: () =>
                Alert.alert('Failed', 'Could not switch plan. Try again.'),
            }),
        },
      ],
    );
  };

  const handleUpdateCard = async () => {
    const result = await collectPaymentMethod();
    if (!result) return;
    replaceCard.mutate(
      { paymentMethodId: result.paymentMethodId },
      {
        onSuccess: () => Alert.alert('Updated', 'Payment method updated.'),
        onError: () =>
          Alert.alert('Failed', 'Could not update card. Try again.'),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Subscription" onBack={() => router.back()} />
      </View>

      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        <Card className="p-5 mb-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-[18px] font-bold text-ink tracking-[-0.3px]">
              {isActive ? 'Active Plan' : isPastDue ? 'Past Due' : 'No Active Plan'}
            </Text>
            {isActive && !sub.cancelAtPeriodEnd && (
              <Badge
                label={sub.plan === 'yearly' ? 'Yearly' : 'Monthly'}
                color={colors.brand}
                bg={colors.brandPale}
                small
              />
            )}
            {sub.cancelAtPeriodEnd && (
              <Badge label="Cancelling" color={colors.red} bg={colors.red + '15'} small />
            )}
          </View>

          {isActive && sub.plan && (
            <>
              <View className="flex-row justify-between py-[10px] border-b-[0.5px] border-separator">
                <Text className="text-[14px] text-secondary">Plan</Text>
                <Text className="text-[14px] font-semibold text-ink">
                  {sub.plan === 'yearly' ? '$9.99/year' : '$0.99/month'}
                </Text>
              </View>
              {sub.currentPeriodEnd && (
                <View className="flex-row justify-between py-[10px] border-b-[0.5px] border-separator">
                  <Text className="text-[14px] text-secondary">
                    {sub.cancelAtPeriodEnd ? 'Access until' : 'Renews on'}
                  </Text>
                  <Text className="text-[14px] font-semibold text-ink">
                    {formatDate(sub.currentPeriodEnd.slice(0, 10))}
                  </Text>
                </View>
              )}
            </>
          )}

          {isPastDue && (
            <View
              className="mt-2 p-3 rounded-md flex-row items-center gap-2"
              style={{ backgroundColor: colors.red + '08' }}
            >
              <Icon name="alert" size={14} color={colors.red} />
              <Text className="text-[13px] text-secondary flex-1">
                Payment failed. Update your card to keep access.
              </Text>
            </View>
          )}

          {isInactive && (
            <View className="items-center py-4">
              <Icon name="card" size={32} color={colors.tertiary} />
              <Text className="text-[14px] text-secondary mt-2 text-center">
                Subscribe to discover and book barbers
              </Text>
            </View>
          )}
        </Card>

        <View className="gap-[10px]">
          {isInactive && (
            <Btn
              label="Subscribe Now"
              full
              onPress={() => router.push('/(app)/paywall')}
            />
          )}

          {isActive && !sub.cancelAtPeriodEnd && (
            <>
              {sub.plan === 'monthly' && (
                <Btn
                  label={switchPlan.isPending ? 'Switching...' : 'Switch to Yearly (Save 17%)'}
                  variant="secondary"
                  full
                  onPress={handleSwitchToYearly}
                  disabled={switchPlan.isPending}
                />
              )}
              <Btn
                label={replaceCard.isPending ? 'Updating...' : 'Update Payment Method'}
                variant="secondary"
                full
                icon="card"
                onPress={handleUpdateCard}
                disabled={replaceCard.isPending}
              />
              <Btn
                label="Cancel Subscription"
                variant="danger"
                full
                onPress={handleCancel}
                disabled={cancelSub.isPending}
              />
            </>
          )}

          {isPastDue && (
            <Btn
              label={replaceCard.isPending ? 'Updating...' : 'Update Payment Method'}
              full
              icon="card"
              onPress={handleUpdateCard}
              disabled={replaceCard.isPending}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
