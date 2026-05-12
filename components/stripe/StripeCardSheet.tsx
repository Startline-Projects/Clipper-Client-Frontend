import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent, type ShouldStartLoadRequest } from 'react-native-webview';
import { useColors } from '@/lib/theme/colors';
import { useTheme } from '@/lib/hooks/useTheme';

const STRIPE_PK = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export interface CardDetails {
  paymentMethodId: string;
  last4: string | null;
  brand: string | null;
}

interface StripeCardSheetProps {
  visible: boolean;
  onPaymentMethod: (details: CardDetails) => void;
  onCancel: () => void;
}

function buildHTML(publishableKey: string, theme: 'light' | 'dark', colors: Record<string, string>) {
  const s = (v: string) => JSON.stringify(v);

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
    h2 {
      color: ${s(colors.ink)};
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 4px;
      letter-spacing: -0.3px;
    }
    .subtitle {
      color: ${s(colors.secondary)};
      font-size: 14px;
      margin-bottom: 24px;
    }
    label {
      display: block;
      color: ${s(colors.secondary)};
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
      letter-spacing: -0.1px;
    }
    #card-element {
      background: ${s(colors.surface)};
      border: 1.5px solid ${s(colors.separatorOpaque)};
      border-radius: 16px;
      padding: 14px 16px;
      min-height: 50px;
    }
    #card-element.StripeElement--focus {
      border-color: ${s(colors.brand)};
    }
    #card-element.StripeElement--invalid {
      border-color: ${s(colors.red)};
    }
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
      margin-top: 24px;
      cursor: pointer;
      -webkit-appearance: none;
    }
    .btn:disabled {
      opacity: 0.5;
    }
    .btn-cancel {
      width: 100%;
      height: 44px;
      border: none;
      border-radius: 12px;
      background: transparent;
      color: ${s(colors.secondary)};
      font-size: 15px;
      font-weight: 500;
      margin-top: 12px;
      cursor: pointer;
      -webkit-appearance: none;
    }
    .secure-note {
      color: ${s(colors.tertiary)};
      font-size: 11px;
      text-align: center;
      margin-top: 16px;
      line-height: 16px;
    }
  </style>
</head>
<body>
  <h2>Add Card</h2>
  <p class="subtitle">Enter your card details below</p>
  <label>Card Details</label>
  <div id="card-element"></div>
  <div id="card-errors" role="alert"></div>
  <button id="submit-btn" class="btn" disabled>Confirm Card</button>
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
    var cardErrors = document.getElementById('card-errors');
    var cardComplete = false;

    card.on('change', function(event) {
      cardComplete = event.complete;
      submitBtn.disabled = !cardComplete;
      cardErrors.textContent = event.error ? event.error.message : '';
    });

    submitBtn.addEventListener('click', function() {
      if (!cardComplete) return;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';

      stripe.createPaymentMethod({ type: 'card', card: card }).then(function(result) {
        if (result.error) {
          cardErrors.textContent = result.error.message;
          submitBtn.disabled = false;
          submitBtn.textContent = 'Confirm Card';
        } else {
          var pm = result.paymentMethod;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'paymentMethod',
            paymentMethodId: pm.id,
            last4: pm.card ? pm.card.last4 : null,
            brand: pm.card ? pm.card.brand : null
          }));
        }
      });
    });

    document.getElementById('cancel-btn').addEventListener('click', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cancel' }));
    });
  </script>
</body>
</html>`;
}

export default function StripeCardSheet({ visible, onPaymentMethod, onCancel }: StripeCardSheetProps) {
  const colors = useColors();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'paymentMethod' && data.paymentMethodId) {
          onPaymentMethod({
            paymentMethodId: data.paymentMethodId,
            last4: data.last4 ?? null,
            brand: data.brand ?? null,
          });
        } else if (data.type === 'cancel') {
          onCancel();
        }
      } catch {
        // ignore malformed messages
      }
    },
    [onPaymentMethod, onCancel],
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

  const html = buildHTML(STRIPE_PK, theme, colorMap);

  const handleShouldStartLoad = useCallback((request: ShouldStartLoadRequest) => {
    if (request.url === 'about:blank' || request.url.startsWith('data:')) return true;
    if (request.url.startsWith('https://js.stripe.com')) return true;
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

        {error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: 8 }}>
              Failed to load payment form
            </Text>
            <Text style={{ fontSize: 14, color: colors.secondary, textAlign: 'center', marginBottom: 20 }}>
              Please check your connection and try again.
            </Text>
            <Pressable
              onPress={() => { setError(false); setLoading(true); webViewRef.current?.reload(); }}
              style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.brand }}
              accessibilityRole="button"
              accessibilityLabel="Retry"
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.white }}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html }}
            originWhitelist={['https://js.stripe.com']}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onMessage={handleMessage}
            onLoadEnd={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
            onHttpError={() => { setLoading(false); setError(true); }}
            style={{ flex: 1, backgroundColor: colors.bg }}
            scrollEnabled={false}
            bounces={false}
            javaScriptEnabled
          />
        )}
      </View>
    </Modal>
  );
}
