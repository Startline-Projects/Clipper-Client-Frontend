import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useColors } from '@/lib/theme/colors';

function usePulse() {
  const opacity = useSharedValue(0.55);
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

interface SkeletonProps {
  className?: string;
  style?: object;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
}

export function Skeleton({
  className,
  style,
  width,
  height,
  borderRadius,
}: SkeletonProps) {
  const colors = useColors();
  const pulse = usePulse();
  return (
    <Animated.View
      className={className}
      style={[
        { backgroundColor: colors.bgHover, width, height, borderRadius },
        style,
        pulse,
      ]}
    />
  );
}

export function SkeletonText({
  width = '60%',
  height = 14,
}: {
  width?: number | string;
  height?: number;
}) {
  return <Skeleton width={width} height={height} borderRadius={4} />;
}

export function SkeletonAvatar({ size = 44 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

export function SkeletonRow() {
  return (
    <View className="flex-row items-center gap-3">
      <SkeletonAvatar size={44} />
      <View className="flex-1 gap-2">
        <SkeletonText width="60%" />
        <SkeletonText width="40%" height={12} />
      </View>
    </View>
  );
}

export function SkeletonCard({ height = 120 }: { height?: number }) {
  return <Skeleton height={height} borderRadius={12} className="w-full" />;
}

export function SkeletonList({
  count = 3,
  height,
}: {
  count?: number;
  height?: number;
}) {
  return (
    <View className="gap-4">
      {Array.from({ length: count }).map((_, i) =>
        height != null ? (
          <Skeleton key={i} height={height} borderRadius={12} />
        ) : (
          <SkeletonRow key={i} />
        ),
      )}
    </View>
  );
}
