import {
  initPaymentSheet,
  presentPaymentSheet,
  confirmPayment as stripeConfirmPayment,
} from '@stripe/stripe-react-native';

export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export async function collectPaymentMethod(): Promise<{
  paymentMethodId: string;
} | null> {
  const { error: initError } = await initPaymentSheet({
    merchantDisplayName: 'Clipper',
    paymentIntentClientSecret: undefined,
    setupIntentClientSecret: undefined,
    customerId: undefined,
    customerEphemeralKeySecret: undefined,
    allowsDelayedPaymentMethods: false,
  });

  if (initError) {
    console.warn('[stripe] initPaymentSheet error:', initError);
    return null;
  }

  const { error: presentError } = await presentPaymentSheet();

  if (presentError) {
    if (presentError.code === 'Canceled') return null;
    console.warn('[stripe] presentPaymentSheet error:', presentError);
    return null;
  }

  return null;
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
