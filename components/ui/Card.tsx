import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  elevated?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Card({
  children,
  onPress,
  elevated,
  className,
  style,
}: CardProps) {
  const base = `bg-card rounded-lg p-4 mb-sm ${
    elevated
      ? 'shadow-sm shadow-black/6'
      : 'border border-separator'
  } ${className ?? ''}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={style} className={`${base} active:opacity-80`}>
        {children}
      </Pressable>
    );
  }

  return <View style={style} className={base}>{children}</View>;
}
