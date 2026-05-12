import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent, type ShouldStartLoadRequest } from 'react-native-webview';
import { useColors } from '@/lib/theme/colors';

const STRIPE_PK = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export interface PaymentResult {
  paymentIntentId: string;
  status: string;
}

interface StripePaymentIntentSheetProps {
  visible: boolean;
  clientSecret: string | null;
  amountUsd: number;
  description?: string;
  onSuccess: (result: PaymentResult) => void;
  onCancel: () => void;
  onError?: (message: string) => void;
}

function buildHTML(
  publishableKey: string,
  clientSecret: string,
  amountUsd: number,
  description: string,
  colors: Record<string, string>,
) {
  const s = (v: string | number) => JSON.stringify(v);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <script src="https://js.stripe.com/v3/"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${s(colors.bg)};
      padding: 24px 20px;
      -webkit-text-size-adjust: 100%;
    }
    .amount-card {
      background: ${s(colors.surface)};
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 20px;
      border: 1px solid ${s(colors.separatorOpaque)};
    }
    .amount-label {
      color: ${s(colors.secondary)};
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .amount-value {
      color: ${s(colors.ink)};
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.6px;
    }
    .amount-desc {
      color: ${s(colors.secondary)};
      font-size: 13px;
      margin-top: 4px;
    }
    h2 {
      color: ${s(colors.ink)};
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 4px;
      letter-spacing: -0.3px;
    }
    .subtitle {
      color: ${s(colors.secondary)};
      font-size: 13px;
      margin-bottom: 16px;
    }
    label {
      display: block;
      color: ${s(colors.secondary)};
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    #card-element {
      background: ${s(colors.surface)};
      border: 1.5px solid ${s(colors.separatorOpaque)};
      border-radius: 16px;
      padding: 14px 16px;
      min-height: 50px;
    }
    #card-element.StripeElement--focus { border-color: ${s(colors.brand)}; }
    #card-element.StripeElement--invalid { border-color: ${s(colors.red)}; }
    #card-errors {
      color: ${s(colors.red)};
      font-size: 12px;
      margin-top: 8px;
      min-height: 18px;
    }
    .btn {
      width: 100%;
      height: 50px;
      border: none;
      border-radius: 16px;
      background: ${s(colors.brand)};
      color: #FFFFFF;
      font-size: 16px;
      font-weight: 600;
      margin-top: 20px;
      cursor: pointer;
      -webkit-appearance: none;
    }
    .btn:disabled { opacity: 0.5; }
    .btn-cancel {
      width: 100%;
      height: 44px;
      border: none;
      border-radius: 12px;
      background: transparent;
      color: ${s(colors.secondary)};
      font-size: 15px;
      font-weight: 500;
      margin-top: 10px;
      cursor: pointer;
      -webkit-appearance: none;
    }
    .secure-note {
      color: ${s(colors.tertiary)};
      font-size: 11px;
      text-align: center;
      margin-top: 14px;
      line-height: 16px;
    }
  </style>
</head>
<body>
  <div class="amount-card">
    <div class="amount-label">Amount Due</div>
    <div class="amount-value">$${amountUsd.toFixed(2)}</div>
    <div class="amount-desc">${description}</div>
  </div>

  <h2>Pay with card</h2>
  <p class="subtitle">Enter your card details to settle this no-show.</p>
  <label>Card Details</label>
  <div id="card-element"></div>
  <div id="card-errors" role="alert"></div>
  <button id="submit-btn" class="btn" disabled>Pay $${amountUsd.toFixed(2)}</button>
  <button id="cancel-btn" class="btn-cancel">Cancel</button>
  <p class="secure-note">Securely processed by Stripe. We never store your full card details.</p>

  <script>
    var stripe = Stripe(${s(publishableKey)});
    var elements = stripe.elements();
    var style = {
      base: {
        color: ${s(colors.ink)},
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '15px',
        '::placeholder': { color: ${s(colors.tertiary)} }
      },
      invalid: { color: ${s(colors.red)} }
    };
    var card = elements.create('card', { style: style, hidePostalCode: true });
    card.mount('#card-element');

    var submitBtn = document.getElementById('submit-btn');
    var cancelBtn = document.getElementById('cancel-btn');
    var cardErrors = document.getElementById('card-errors');
    var cardComplete = false;
    var clientSecret = ${s(clientSecret)};

    card.on('change', function(event) {
      cardComplete = event.complete;
      submitBtn.disabled = !cardComplete;
      cardErrors.textContent = event.error ? event.error.message : '';
    });

    submitBtn.addEventListener('click', function() {
      if (!cardComplete) return;
      submitBtn.disabled = true;
      cancelBtn.disabled = true;
      submitBtn.textContent = 'Processing...';

      stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: card }
      }).then(function(result) {
        if (result.error) {
          cardErrors.textContent = result.error.message;
          submitBtn.disabled = false;
          cancelBtn.disabled = false;
          submitBtn.textContent = 'Pay $${amountUsd.toFixed(2)}';
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: result.error.message
          }));
        } else {
          var pi = result.paymentIntent;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'success',
            paymentIntentId: pi.id,
            status: pi.status
          }));
        }
      });
    });

    cancelBtn.addEventListener('click', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cancel' }));
    });
  </script>
</body>
</html>`;
}

export default function StripePaymentIntentSheet({
  visible,
  clientSecret,
  amountUsd,
  description = 'No-show fee',
  onSuccess,
  onCancel,
  onError,
}: StripePaymentIntentSheetProps) {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'success' && data.paymentIntentId) {
          onSuccess({ paymentIntentId: data.paymentIntentId, status: data.status });
        } else if (data.type === 'cancel') {
          onCancel();
        } else if (data.type === 'error') {
          onError?.(data.message ?? 'Payment failed');
        }
      } catch {
        // ignore malformed
      }
    },
    [onSuccess, onCancel, onError],
  );

  const colorMap = {
    bg: colors.bg,
    ink: colors.ink,
    surface: colors.surface,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    separatorOpaque: colors.separatorOpaque,
    brand: colors.brand,
    red: colors.red,
  };

  const html =
    clientSecret != null
      ? buildHTML(STRIPE_PK, clientSecret, amountUsd, description, colorMap)
      : '';

  const handleShouldStartLoad = useCallback((request: ShouldStartLoadRequest) => {
    if (request.url === 'about:blank' || request.url.startsWith('data:')) return true;
    if (request.url.startsWith('https://js.stripe.com')) return true;
    if (request.url.startsWith('https://hooks.stripe.com')) return true;
    return false;
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          <Pressable onPress={onCancel} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.brand }}>
              Close
            </Text>
          </Pressable>
        </View>

        {loading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        )}

        {errored || !clientSecret ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: 8 }}>
              Failed to load payment form
            </Text>
            <Text style={{ fontSize: 14, color: colors.secondary, textAlign: 'center', marginBottom: 20 }}>
              Please close and try again.
            </Text>
            <Pressable
              onPress={() => { setErrored(false); setLoading(true); webViewRef.current?.reload(); }}
              style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.brand }}
              accessibilityRole="button"
              accessibilityLabel="Retry"
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html }}
            originWhitelist={['https://js.stripe.com', 'https://hooks.stripe.com']}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onMessage={handleMessage}
            onLoadEnd={() => setLoading(false)}
            onError={() => { setLoading(false); setErrored(true); }}
            onHttpError={() => { setLoading(false); setErrored(true); }}
            style={{ flex: 1, backgroundColor: colors.bg }}
            bounces={false}
            javaScriptEnabled
          />
        )}
      </View>
    </Modal>
  );
}
