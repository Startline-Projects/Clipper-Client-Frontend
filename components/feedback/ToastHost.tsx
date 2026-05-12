import { useEffect, useState } from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import { useColors } from '@/lib/theme/colors';
import { subscribeToasts, dismiss, type Toast } from '@/lib/feedback/toast';

const VARIANT_CONFIG: Record<
  Toast['variant'],
  { icon: IconName; colorKey: 'red' | 'green' | 'blue' }
> = {
  error: { icon: 'alert', colorKey: 'red' },
  success: { icon: 'check', colorKey: 'green' },
  info: { icon: 'info', colorKey: 'blue' },
  loading: { icon: 'info', colorKey: 'blue' },
};

export default function ToastHost() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 12,
        right: 12,
        zIndex: 9999,
      }}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => {
        const config = VARIANT_CONFIG[toast.variant];
        const tint = colors[config.colorKey];
        return (
          <Animated.View
            key={toast.id}
            entering={FadeInUp.duration(220).springify()}
            exiting={FadeOutUp.duration(160)}
            layout={LinearTransition}
            style={{
              backgroundColor: colors.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.separator,
              padding: 12,
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: tint + '1A',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {toast.variant === 'loading' ? (
                <ActivityIndicator size="small" color={tint} />
              ) : (
                <Icon name={config.icon} size={16} color={tint} />
              )}
            </View>
            <View className="flex-1">
              {toast.title && (
                <Text className="text-[13px] font-bold text-ink">
                  {toast.title}
                </Text>
              )}
              <Text className="text-[13px] text-secondary">{toast.message}</Text>
              {toast.action && (
                <Pressable onPress={toast.action.onPress} className="mt-1" accessibilityRole="button" accessibilityLabel={toast.action.label}>
                  <Text className="text-[13px] font-bold text-blue">
                    {toast.action.label}
                  </Text>
                </Pressable>
              )}
            </View>
            {toast.variant !== 'loading' && (
              <Pressable
                onPress={() => dismiss(toast.id)}
                hitSlop={12}
                className="p-3"
                accessibilityRole="button"
                accessibilityLabel="Dismiss notification"
              >
                <Icon name="close" size={14} color={colors.tertiary} />
              </Pressable>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
}
