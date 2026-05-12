import { View, Text } from 'react-native';
import Icon from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import Btn from '@/components/ui/Btn';
import { useColors } from '@/lib/theme/colors';
import { mapApiError } from '@/lib/api/error-map';

interface ErrorViewProps {
  error?: unknown;
  title?: string;
  message?: string;
  icon?: IconName;
  onRetry?: () => void;
  primaryCta?: { label: string; onPress: () => void };
  onSecondary?: { label: string; onPress: () => void };
}

export default function ErrorView({
  error,
  title: titleOverride,
  message: messageOverride,
  icon: iconOverride,
  onRetry,
  primaryCta,
  onSecondary,
}: ErrorViewProps) {
  const colors = useColors();
  const mapped = error ? mapApiError(error) : null;
  const title = titleOverride ?? mapped?.title ?? 'Something went wrong';
  const message =
    messageOverride ?? mapped?.message ?? 'An unexpected error occurred';
  const icon = iconOverride ?? (mapped?.isAuth ? 'shield' : 'alert');

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View
        style={{ backgroundColor: colors.red + '1A' }}
        className="w-[68px] h-[68px] rounded-full items-center justify-center mb-4"
      >
        <Icon name={icon} size={32} color={colors.red} />
      </View>
      <Text className="text-[18px] font-bold text-ink text-center mb-2">
        {title}
      </Text>
      <Text className="text-[14px] text-secondary text-center leading-[20px] mb-6">
        {message}
      </Text>
      {(primaryCta || onRetry) && (
        <Btn
          label={primaryCta?.label ?? 'Try again'}
          variant="primary"
          full
          icon={primaryCta ? undefined : 'loop'}
          onPress={primaryCta?.onPress ?? onRetry}
        />
      )}
      {onSecondary && (
        <View className="mt-[10px] w-full">
          <Btn
            label={onSecondary.label}
            variant="ghost"
            full
            onPress={onSecondary.onPress}
          />
        </View>
      )}
    </View>
  );
}
