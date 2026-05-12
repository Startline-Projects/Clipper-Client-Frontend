import { Text, View } from 'react-native';
import { useColors } from '@/lib/theme/colors';
import { useTheme } from '@/lib/hooks/useTheme';

interface StatCardProps {
  value: string | number;
  label: string;
  dark?: boolean;
}

export default function StatCard({ value, label, dark }: StatCardProps) {
  const colors = useColors();
  const theme = useTheme();
  const isLight = theme === 'light';

  return (
    <View
      style={dark ? { backgroundColor: isLight ? colors.ink : colors.white } : undefined}
      className={`flex-1 rounded-lg px-[14px] py-4 ${
        dark ? '' : 'bg-surface border border-separator'
      }`}
    >
      <Text
        style={dark ? { color: isLight ? colors.white + '73' : colors.ink + '66' } : undefined}
        className={`text-[11px] font-bold tracking-[0.6px] uppercase ${
          dark ? '' : 'text-tertiary'
        }`}
      >
        {label}
      </Text>
      <Text
        style={dark ? { color: isLight ? colors.white : colors.ink } : undefined}
        className={`text-[30px] font-extrabold tracking-[-1px] mt-[6px] ${
          dark ? '' : 'text-ink'
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
