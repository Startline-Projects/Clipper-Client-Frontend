import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
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
      background: ${colors.bg};
      padding: 24px 20px;
      -webkit-text-size-adjust: 100%;
    }
    h2 {
      color: ${colors.ink};
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 4px;
      letter-spacing: -0.3px;
    }
    .subtitle {
      color: ${colors.secondary};
      font-size: 14px;
      margin-bottom: 24px;
    }
    label {
      display: block;
      color: ${colors.secondary};
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
      letter-spacing: -0.1px;
    }
    #card-element {
      background: ${colors.surface};
      border: 1.5px solid ${colors.separatorOpaque};
      border-radius: 16px;
      padding: 14px 16px;
      min-height: 50px;
    }
    #card-element.StripeElement--focus {
      border-color: ${colors.brand};
    }
    #card-element.StripeElement--invalid {
      border-color: ${colors.red};
    }
    #card-errors {
      color: ${colors.red};
      font-size: 12px;
      margin-top: 8px;
      min-height: 18px;
    }
    .btn {
      width: 100%;
      height: 50px;
      border: none;
      border-radius: 16px;
      background: ${colors.brand};
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
      color: ${colors.secondary};
      font-size: 15px;
      font-weight: 500;
      margin-top: 12px;
      cursor: pointer;
      -webkit-appearance: none;
    }
    .secure-note {
      color: ${colors.tertiary};
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
    var stripe = Stripe('${publishableKey}');
    var elements = stripe.elements();
    var style = {
      base: {
        color: '${colors.ink}',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '15px',
        '::placeholder': { color: '${colors.tertiary}' }
      },
      invalid: { color: '${colors.red}' }
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
          <Pressable onPress={onCancel} hitSlop={12}>
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

        <WebView
          ref={webViewRef}
          source={{ html }}
          originWhitelist={['*']}
          onMessage={handleMessage}
          onLoadEnd={() => setLoading(false)}
          style={{ flex: 1, backgroundColor: colors.bg }}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled
        />
      </View>
    </Modal>
  );
}
