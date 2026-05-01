import { Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import { formatCurrency, formatDuration } from '@/lib/utils/format';

interface ServiceLine {
  name: string;
  durationMinutes: number;
  pricing: {
    basePrice: number;
    additionalCost: number;
    totalPrice: number;
  };
}

interface PriceBreakdownProps {
  services: ServiceLine[];
  total: {
    basePrice: number;
    additionalCost: number;
    totalPrice: number;
  };
}

export default function PriceBreakdown({ services, total }: PriceBreakdownProps) {
  return (
    <Card className="p-[14px] mb-0">
      {services.map((s, idx) => (
        <View
          key={idx}
          className={`flex-row justify-between items-center py-[8px] ${
            idx < services.length - 1 ? 'border-b-[0.5px] border-separator' : ''
          }`}
        >
          <View className="flex-1 min-w-0">
            <Text className="text-[14px] font-medium text-ink tracking-[-0.1px]" numberOfLines={1}>
              {s.name}
            </Text>
            <Text className="text-[12px] text-tertiary mt-[2px]">
              {formatDuration(s.durationMinutes)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[15px] font-semibold text-ink">
              {formatCurrency(s.pricing.totalPrice)}
            </Text>
            {s.pricing.additionalCost > 0 && (
              <Text className="text-[11px] text-tertiary">
                +{formatCurrency(s.pricing.additionalCost)} surcharge
              </Text>
            )}
          </View>
        </View>
      ))}

      <View className="border-t border-separator-opaque mt-[4px] pt-3 flex-row justify-between items-center">
        <Text className="text-[16px] font-bold text-ink tracking-[-0.2px]">Total</Text>
        <Text className="text-[20px] font-extrabold text-ink tracking-[-0.3px]">
          {formatCurrency(total.totalPrice)}
        </Text>
      </View>
    </Card>
  );
}
