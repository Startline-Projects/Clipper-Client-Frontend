import { useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardField, type CardFieldInput } from '@stripe/stripe-react-native';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Icon from '@/components/ui/Icon';
import PlanSelector from '@/components/subscription/PlanSelector';
import { useCreateSubscription, useSubscription } from '@/lib/hooks/useSubscription';
import { useColors } from '@/lib/theme/colors';
import { collectPaymentMethod, confirmPayment } from '@/lib/utils/stripe';
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
  const { refetch: refetchSub } = useSubscription();
  const [plan, setPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubscribe = async () => {
    if (!plan || loading) return;
    setLoading(true);

    try {
      const pmResult = await collectPaymentMethod();
      if (!pmResult) {
        setLoading(false);
        return;
      }

      const result = await createSub.mutateAsync({
        plan,
        paymentMethodId: pmResult.paymentMethodId,
      });

      if (result.clientSecret) {
        const payment = await confirmPayment(result.clientSecret);
        if (!payment.success) {
          Alert.alert('Payment Failed', payment.error ?? 'Try again.');
          setLoading(false);
          return;
        }
      }

      for (let i = 0; i < 10; i++) {
        const { data: subState } = await refetchSub();
        if (subState?.status === 'active') break;
        await new Promise((r) => setTimeout(r, 1500));
      }

      Alert.alert(
        'Welcome to Clipper!',
        'Your subscription is active. Start exploring barbers.',
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/(app)/(tabs)/explore'),
          },
        ],
      );
    } catch {
      Alert.alert('Failed', 'Could not complete subscription. Try again.');
    } finally {
      setLoading(false);
    }
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

        <View className="mt-6 mb-2">
          <Text className="text-[13px] font-semibold text-secondary mb-[6px] tracking-[-0.1px]">
            Payment Details
          </Text>
          <CardField
            postalCodeEnabled={false}
            placeholders={{ number: '4242 4242 4242 4242' }}
            cardStyle={{
              backgroundColor: colors.surface,
              textColor: colors.ink,
              placeholderColor: colors.tertiary,
              borderColor: colors.separatorOpaque,
              borderWidth: 1.5,
              borderRadius: 16,
              fontSize: 15,
            }}
            style={{ width: '100%', height: 50 }}
            onCardChange={(details: CardFieldInput.Details) => {
              setCardComplete(details.complete);
            }}
          />
        </View>

        <View className="mt-4">
          <Btn
            label={loading ? 'Processing...' : 'Subscribe'}
            full
            onPress={handleSubscribe}
            disabled={!plan || !cardComplete || loading}
          />
        </View>

        <Text className="text-[11px] text-tertiary text-center mt-4 leading-[16px]">
          Cancel anytime from your profile settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
