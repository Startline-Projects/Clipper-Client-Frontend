import { useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import StripeCardSheet, { type CardDetails } from '@/components/stripe/StripeCardSheet';
import {
  useSubscription,
  useReplacePaymentMethod,
  useRemovePaymentMethod,
} from '@/lib/hooks/useSubscription';
import { usePaymentMethodStore } from '@/lib/stores/payment-method';
import { useColors } from '@/lib/theme/colors';
import { confirm } from '@/lib/feedback/confirm';
import { showSuccessToast, showErrorToast } from '@/lib/feedback/toast';

export default function PaymentMethodScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data: sub, isLoading, isRefetching, refetch } = useSubscription();
  const replaceCard = useReplacePaymentMethod();
  const removeCard = useRemovePaymentMethod();
  const [showCardSheet, setShowCardSheet] = useState(false);
  const savedCard = usePaymentMethodStore((s) => s.savedCard);
  const setSavedCard = usePaymentMethodStore((s) => s.setSavedCard);
  const clearSavedCard = usePaymentMethodStore((s) => s.clearSavedCard);

  if (isLoading) return <LoadingSpinner />;

  const hasSubscription = sub?.status === 'active' || sub?.status === 'past_due';

  const handlePaymentMethod = ({ paymentMethodId, last4, brand }: CardDetails) => {
    setShowCardSheet(false);
    replaceCard.mutate(
      { paymentMethodId },
      {
        onSuccess: () => {
          showSuccessToast('Card saved successfully');
          if (last4 && brand) setSavedCard({ paymentMethodId, last4, brand });
        },
        onError: (err) => showErrorToast(err),
      },
    );
  };

  const handleRemoveCard = async () => {
    const yes = await confirm({
      title: 'Remove card?',
      message: 'Your saved payment method will be removed. You may need to add a new one to continue your subscription.',
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!yes) return;
    removeCard.mutate(undefined, {
      onSuccess: () => {
        showSuccessToast('Card removed');
        clearSavedCard();
      },
      onError: (err) => showErrorToast(err),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Payment Method" onBack={() => router.back()} />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="pb-8"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
        {savedCard && (
          <Card className="p-5 mb-4">
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.brandPale }}
              >
                <Icon name="card" size={18} color={colors.brand} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-ink tracking-[-0.2px]">
                  {savedCard.brand.charAt(0).toUpperCase() + savedCard.brand.slice(1)} •••• {savedCard.last4}
                </Text>
                <Text className="text-[13px] text-secondary mt-[2px]">
                  Current payment method
                </Text>
              </View>
              <Icon name="check" size={18} color={colors.brand} />
            </View>
          </Card>
        )}

        <Card className="p-5 mb-6">
          <View className="flex-row items-center gap-3 mb-3">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.brandPale }}
            >
              <Icon name="card" size={18} color={colors.brand} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-ink tracking-[-0.2px]">
                {savedCard ? 'Replace card' : hasSubscription ? 'Update your card' : 'Add a card'}
              </Text>
              <Text className="text-[13px] text-secondary mt-[2px]">
                {savedCard
                  ? 'Add a different payment method'
                  : hasSubscription
                    ? 'Replace your current payment method'
                    : 'Add a payment method for bookings'}
              </Text>
            </View>
          </View>
        </Card>

        <View className="mt-4 gap-[10px]">
          <Btn
            label={replaceCard.isPending ? 'Saving...' : 'Add / Replace Card'}
            full
            icon="card"
            onPress={() => setShowCardSheet(true)}
            disabled={replaceCard.isPending}
          />

          {hasSubscription && (
            <Btn
              label={removeCard.isPending ? 'Removing...' : 'Remove Card'}
              variant="danger"
              full
              onPress={handleRemoveCard}
              disabled={removeCard.isPending}
            />
          )}
        </View>

        <Text className="text-[11px] text-tertiary text-center mt-4 leading-[16px]">
          Your card is securely processed by Stripe.{'\n'}
          We never store your full card details.
        </Text>

        <StripeCardSheet
          visible={showCardSheet}
          onPaymentMethod={handlePaymentMethod}
          onCancel={() => setShowCardSheet(false)}
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
