import {
  createPaymentMethod,
  confirmPayment as stripeConfirmPayment,
} from '@stripe/stripe-react-native';

export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export async function collectPaymentMethod(): Promise<{
  paymentMethodId: string;
} | null> {
  const { paymentMethod, error } = await createPaymentMethod({
    paymentMethodType: 'Card',
  });

  if (error) {
    if (error.code === 'Canceled') return null;
    console.warn('[stripe] createPaymentMethod error:', error);
    return null;
  }

  if (!paymentMethod?.id) return null;

  return { paymentMethodId: paymentMethod.id };
}

export async function confirmPayment(
  clientSecret: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await stripeConfirmPayment(clientSecret, {
    paymentMethodType: 'Card',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
