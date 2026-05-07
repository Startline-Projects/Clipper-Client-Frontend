import { Text, View } from 'react-native';
import Icon, { type IconName } from '@/components/ui/Icon';
import Btn from '@/components/ui/Btn';
import { useColors } from '@/lib/theme/colors';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  body?: string;
  cta?: { label: string; onPress: () => void };
  secondary?: { label: string; onPress: () => void };
  variant?: 'default' | 'compact';
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  body,
  cta,
  secondary,
  variant = 'default',
}: EmptyStateProps) {
  const colors = useColors();
  const isCompact = variant === 'compact';
  const displayText = body ?? subtitle;
  const hasButtons = Boolean(cta || secondary);

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View
        className={`rounded-full bg-bgWarm items-center justify-center mb-4 ${
          isCompact ? 'w-[52px] h-[52px]' : 'w-[68px] h-[68px]'
        }`}
      >
        <Icon name={icon} size={isCompact ? 22 : 28} color={colors.tertiary} />
      </View>
      <Text
        className={`text-ink text-center tracking-[-0.2px] ${
          isCompact
            ? 'text-[15px] font-semibold mb-1'
            : 'text-[18px] font-bold mb-1'
        }`}
      >
        {title}
      </Text>
      {displayText && (
        <Text
          className={`text-[14px] text-secondary text-center leading-[20px] ${
            hasButtons ? 'mb-4' : ''
          }`}
        >
          {displayText}
        </Text>
      )}
      {hasButtons && (
        <View className="w-full px-4 gap-[10px]">
          {cta && (
            <Btn
              label={cta.label}
              variant="primary"
              full
              onPress={cta.onPress}
            />
          )}
          {secondary && (
            <Btn
              label={secondary.label}
              variant="ghost"
              full
              onPress={secondary.onPress}
            />
          )}
        </View>
      )}
    </View>
  );
}
