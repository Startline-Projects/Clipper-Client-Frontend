import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import StripeCardSheet from '@/components/stripe/StripeCardSheet';
import {
  useSubscription,
  useSwitchPlan,
  useCancelSubscription,
  useReplacePaymentMethod,
  useReactivateSubscription,
} from '@/lib/hooks/useSubscription';
import { usePaymentMethodStore } from '@/lib/stores/payment-method';
import { useColors } from '@/lib/theme/colors';
import { formatDate } from '@/lib/utils/format';
import { confirm } from '@/lib/feedback/confirm';
import { showSuccessToast, showErrorToast } from '@/lib/feedback/toast';

export default function SubscriptionScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data: sub, isLoading, isRefetching, refetch } = useSubscription();
  const subscribedPlan = usePaymentMethodStore((s) => s.subscribedPlan);
  const clearSubscribedPlan = usePaymentMethodStore((s) => s.clearSubscribedPlan);
  const switchPlan = useSwitchPlan();
  const cancelSub = useCancelSubscription();
  const replaceCard = useReplacePaymentMethod();
  const reactivate = useReactivateSubscription();
  const [showCardSheet, setShowCardSheet] = useState(false);

  if (isLoading || !sub) return <LoadingSpinner />;

  const isActive = sub.status === 'active';
  const isInactive = sub.status === 'inactive';
  const isPastDue = sub.status === 'past_due';
  const isCancelled = sub.status === 'cancelled';
  const showKeepBtn = isActive && sub.cancelAtPeriodEnd;
  const showRenewBtn = isCancelled || isPastDue;

  const handleKeepSubscription = () => {
    reactivate.mutate(undefined, {
      onSuccess: () => showSuccessToast('Your subscription has been reactivated.'),
      onError: (err) => showErrorToast(err),
    });
  };

  const handleCancel = async () => {
    const yes = await confirm({
      title: 'Cancel subscription?',
      message: 'You\'ll keep access until the end of your billing period.',
      confirmLabel: 'Cancel Subscription',
      cancelLabel: 'Keep Plan',
      destructive: true,
    });
    if (!yes) return;
    cancelSub.mutate(undefined, {
      onSuccess: () => {
        clearSubscribedPlan();
        showSuccessToast('Subscription cancelled');
      },
      onError: (err) => showErrorToast(err),
    });
  };

  const handleSwitchToYearly = async () => {
    const yes = await confirm({
      title: 'Switch to yearly?',
      message: 'You\'ll be switched to $9.99/year (save 17%). Change takes effect at next billing cycle.',
      confirmLabel: 'Switch',
    });
    if (!yes) return;
    switchPlan.mutate(undefined, {
      onSuccess: () => showSuccessToast('Plan changed to yearly'),
      onError: (err) => showErrorToast(err),
    });
  };

  const handleUpdateCard = () => {
    setShowCardSheet(true);
  };

  const handlePaymentMethod = ({ paymentMethodId }: { paymentMethodId: string }) => {
    setShowCardSheet(false);
    replaceCard.mutate(
      { paymentMethodId },
      {
        onSuccess: () => showSuccessToast('Payment method updated'),
        onError: (err) => showErrorToast(err),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Subscription" onBack={() => router.back()} />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <Card className="p-5 mb-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-[18px] font-bold text-ink tracking-[-0.3px]">
              {isActive ? 'Active Plan' : isPastDue ? 'Past Due' : 'No Active Plan'}
            </Text>
            {isActive && !sub.cancelAtPeriodEnd && (
              <Badge
                label={(sub.plan ?? subscribedPlan) === 'yearly' ? 'Yearly' : 'Monthly'}
                color={colors.brand}
                bg={colors.brandPale}
                small
              />
            )}
            {sub.cancelAtPeriodEnd && (
              <Badge label="Cancelling" color={colors.red} bg={colors.red + '1A'} small />
            )}
            {isCancelled && (
              <Badge label="Subscription ended" color={colors.red} bg={colors.red + '1A'} small />
            )}
          </View>

          {showKeepBtn && sub.currentPeriodEnd && (
            <View
              className="mb-3 p-3 rounded-md flex-row items-center gap-2"
              style={{ backgroundColor: colors.red + '0D' }}
            >
              <Icon name="alert" size={14} color={colors.red} />
              <Text className="text-[13px] text-secondary flex-1">
                Cancels on {formatDate(sub.currentPeriodEnd.slice(0, 10))}
              </Text>
            </View>
          )}

          {isActive && (sub.plan || subscribedPlan) && (
            <>
              <View className="flex-row justify-between py-[10px] border-b-[0.5px] border-separator">
                <Text className="text-[14px] text-secondary">Plan</Text>
                <Text className="text-[14px] font-semibold text-ink">
                  {(sub.plan ?? subscribedPlan) === 'yearly' ? '$9.99/year' : '$0.99/month'}
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
              style={{ backgroundColor: colors.red + '0D' }}
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

          {showKeepBtn && (
            <Btn
              label={reactivate.isPending ? 'Reactivating...' : 'Keep Subscription'}
              full
              onPress={handleKeepSubscription}
              disabled={reactivate.isPending}
            />
          )}

          {showRenewBtn && (
            <Btn
              label="Renew Subscription"
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

      <StripeCardSheet
        visible={showCardSheet}
        onPaymentMethod={handlePaymentMethod}
        onCancel={() => setShowCardSheet(false)}
      />
    </SafeAreaView>
  );
}
