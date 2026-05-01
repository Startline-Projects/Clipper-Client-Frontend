import { Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import { useColors } from '@/lib/theme/colors';
import { formatDate } from '@/lib/utils/format';

interface SubscriptionStatusCardProps {
  plan: 'monthly' | 'yearly';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export default function SubscriptionStatusCard({
  plan,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: SubscriptionStatusCardProps) {
  const colors = useColors();
  const periodDate = formatDate(currentPeriodEnd.slice(0, 10));

  return (
    <Card
      className="p-[18px] mb-md"
      style={{ borderLeftWidth: 3, borderLeftColor: colors.brand }}
    >
      <Text className="text-[13px] font-semibold text-brand">Current plan</Text>
      <Text className="text-[20px] font-bold text-ink mt-[6px] tracking-[-0.3px]">
        {plan === 'yearly' ? 'Yearly · $9.99/yr' : 'Monthly · $0.99/mo'}
      </Text>
      <Text
        className={`text-[12px] mt-1 ${cancelAtPeriodEnd ? 'font-medium text-red' : 'text-tertiary'}`}
      >
        {cancelAtPeriodEnd ? `Cancels on ${periodDate}` : `Renews ${periodDate}`}
      </Text>
    </Card>
  );
}
