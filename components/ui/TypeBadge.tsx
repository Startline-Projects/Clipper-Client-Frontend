import Badge from './Badge';
import { useColors } from '@/lib/theme/colors';

interface TypeBadgeProps {
  type: string;
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  const colors = useColors();

  const map: Record<string, [string, string]> = {
    regular: [colors.green, 'Regular'],
    after_hours: [colors.orange, 'After-Hrs'],
    day_off: [colors.purple, 'Day-Off'],
    recurring: [colors.blue, 'Recurring'],
  };

  const fallbackLabel = type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' + ');

  const [accent, label] = map[type] ?? [colors.quaternary, fallbackLabel];

  return <Badge bg={accent + '1A'} color={accent} label={label} />;
}
