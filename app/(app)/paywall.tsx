import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import PlanSelector from '@/components/subscription/PlanSelector';
import StripeCardSheet from '@/components/stripe/StripeCardSheet';
import { useCreateSubscription } from '@/lib/hooks/useSubscription';
import { usePaymentMethodStore } from '@/lib/stores/payment-method';
import { useColors } from '@/lib/theme/colors';
import { showSuccessToast, showErrorToast } from '@/lib/feedback/toast';
import type { IconName } from '@/components/ui/Icon';

const VALUE_PROPS: { icon: IconName; title: string; sub: string }[] = [
  {
    icon: 'search',
    title: 'Discover barbers near you',
    sub: 'Browse top-rated barbers in your area with real reviews',
  },
  {
    icon: 'calendar',
    title: 'Book instantly',
    sub: 'See real-time availability and book in seconds',
  },
  {
    icon: 'repeat',
    title: 'Lock in recurring slots',
    sub: 'Reserve your preferred time every week at a discount',
  },
  {
    icon: 'chat',
    title: 'Message your barber',
    sub: 'Coordinate directly without leaving the app',
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const colors = useColors();
  const createSub = useCreateSubscription();
  const savedCard = usePaymentMethodStore((s) => s.savedCard);
  const setSavedCard = usePaymentMethodStore((s) => s.setSavedCard);
  const setSubscribedPlan = usePaymentMethodStore((s) => s.setSubscribedPlan);
  const [plan, setPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCardSheet, setShowCardSheet] = useState(false);
  const [useExistingCard, setUseExistingCard] = useState(true);

  const handleSubscribe = () => {
    if (!plan) return;
    if (savedCard && useExistingCard) {
      subscribe(savedCard.paymentMethodId);
    } else {
      setShowCardSheet(true);
    }
  };

  const subscribe = async (paymentMethodId: string) => {
    if (!plan) return;
    setLoading(true);

    try {
      await createSub.mutateAsync({ plan, paymentMethodId });

      // Persist locally so UI stays correct even if query refetches stale backend data
      setSubscribedPlan(plan);

      showSuccessToast('Welcome to Clipper!', 'Subscription active');
      router.replace('/(app)/(tabs)/explore');
    } catch (err) {
      console.error('[Paywall] subscription error:', err);
      showErrorToast(err, 'Could not complete subscription. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethod = ({ paymentMethodId, last4, brand }: { paymentMethodId: string; last4?: string | null; brand?: string | null }) => {
    setShowCardSheet(false);
    if (last4 && brand) setSavedCard({ paymentMethodId, last4, brand });
    subscribe(paymentMethodId);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="" onBack={() => router.back()} />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-8"
      >
        <View className="items-center mb-6">
          <Image
            source={require('@/assets/icon.png')}
            className="w-[64px] h-[64px] rounded-[18px] mb-3"
          />
          <Text className="text-[24px] font-bold text-ink tracking-[-0.5px] text-center">
            Unlock Clipper
          </Text>
          <Text className="text-[14px] text-secondary text-center mt-1 leading-[20px]">
            Subscribe to discover, book, and message barbers
          </Text>
        </View>

        <View className="gap-4 mb-8">
          {VALUE_PROPS.map((prop) => (
            <View key={prop.title} className="flex-row gap-3">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.bgWarm,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={prop.icon} size={18} color={colors.brand} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-ink tracking-[-0.2px]">
                  {prop.title}
                </Text>
                <Text className="text-[13px] text-secondary mt-[2px] leading-[18px]">
                  {prop.sub}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <PlanSelector selected={plan} onSelect={setPlan} />

        {plan && (
          <View className="mt-6">
            <Text className="text-[13px] font-semibold text-secondary mb-3">
              Payment Method
            </Text>

            {savedCard && (
              <Pressable onPress={() => setUseExistingCard(true)}>
                <Card
                  className="p-4 mb-[10px] flex-row items-center gap-3"
                  style={useExistingCard ? { borderWidth: 1.5, borderColor: colors.brand } : undefined}
                >
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.brandPale }}
                  >
                    <Icon name="card" size={16} color={colors.brand} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-semibold text-ink">
                      {savedCard.brand.charAt(0).toUpperCase() + savedCard.brand.slice(1)} •••• {savedCard.last4}
                    </Text>
                    <Text className="text-[12px] text-secondary">Saved card</Text>
                  </View>
                  {useExistingCard && (
                    <Icon name="check" size={16} color={colors.brand} />
                  )}
                </Card>
              </Pressable>
            )}

            <Pressable onPress={() => setUseExistingCard(false)}>
              <Card
                className="p-4 flex-row items-center gap-3"
                style={!useExistingCard || !savedCard ? { borderWidth: 1.5, borderColor: colors.brand } : undefined}
              >
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.bgWarm }}
                >
                  <Icon name="plus" size={16} color={colors.ink} />
                </View>
                <Text className="text-[15px] font-medium text-ink">
                  Add new card
                </Text>
              </Card>
            </Pressable>
          </View>
        )}

        <View className="mt-6">
          <Btn
            label={loading ? 'Processing...' : 'Subscribe'}
            full
            onPress={handleSubscribe}
            disabled={!plan || loading}
          />
        </View>

        <Text className="text-[11px] text-tertiary text-center mt-4 leading-[16px]">
          Cancel anytime from your profile settings.
        </Text>

        <StripeCardSheet
          visible={showCardSheet}
          onPaymentMethod={handlePaymentMethod}
          onCancel={() => setShowCardSheet(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
