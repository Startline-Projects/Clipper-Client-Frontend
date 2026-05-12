import { View, Text } from 'react-native';
import Animated, { ZoomIn, FadeIn } from 'react-native-reanimated';
import Icon from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import Btn from '@/components/ui/Btn';
import { useColors } from '@/lib/theme/colors';

interface SuccessViewProps {
  title: string;
  message?: string;
  icon?: IconName;
  details?: React.ReactNode;
  primaryCta?: { label: string; onPress: () => void };
  secondaryCta?: { label: string; onPress: () => void };
}

export default function SuccessView({
  title,
  message,
  icon = 'check',
  details,
  primaryCta,
  secondaryCta,
}: SuccessViewProps) {
  const colors = useColors();

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Animated.View
        entering={ZoomIn.delay(100).springify()}
        style={{ backgroundColor: colors.green + '1A' }}
        className="w-[68px] h-[68px] rounded-full items-center justify-center mb-4"
      >
        <Icon name={icon} size={32} color={colors.green} />
      </Animated.View>
      <Animated.Text
        entering={FadeIn.delay(120).duration(300)}
        className="text-[20px] font-bold text-ink text-center"
      >
        {title}
      </Animated.Text>
      {message && (
        <Animated.Text
          entering={FadeIn.delay(200).duration(300)}
          className="text-[14px] text-secondary text-center leading-[20px] mt-2"
        >
          {message}
        </Animated.Text>
      )}
      {details && (
        <Animated.View
          entering={FadeIn.delay(280).duration(300)}
          className="w-full mt-6"
          style={{ maxWidth: 360, alignSelf: 'center' }}
        >
          {details}
        </Animated.View>
      )}
      {(primaryCta || secondaryCta) && (
        <View className="w-full gap-[10px] mt-8">
          {primaryCta && (
            <Btn
              label={primaryCta.label}
              variant="primary"
              full
              onPress={primaryCta.onPress}
            />
          )}
          {secondaryCta && (
            <Btn
              label={secondaryCta.label}
              variant="ghost"
              full
              onPress={secondaryCta.onPress}
            />
          )}
        </View>
      )}
    </View>
  );
}
