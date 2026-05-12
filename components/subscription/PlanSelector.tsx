import { Pressable, Text, View } from 'react-native';
import { useColors } from '@/lib/theme/colors';

const PLANS = [
  {
    key: 'monthly' as const,
    label: 'Monthly',
    price: '$0.99',
    period: '/month',
    description: 'Cancel anytime',
  },
  {
    key: 'yearly' as const,
    label: 'Yearly',
    price: '$9.99',
    period: '/year',
    description: 'Save 17% vs monthly',
    badge: 'SAVE 17%',
  },
];

interface PlanSelectorProps {
  selected: 'monthly' | 'yearly' | null;
  onSelect: (plan: 'monthly' | 'yearly') => void;
}

export default function PlanSelector({ selected, onSelect }: PlanSelectorProps) {
  const colors = useColors();

  return (
    <View className="gap-3">
      {PLANS.map((plan) => {
        const active = selected === plan.key;

        return (
          <Pressable
            key={plan.key}
            onPress={() => onSelect(plan.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${plan.label} plan, ${plan.price}${plan.period}`}
            className="active:opacity-80"
            style={{
              borderWidth: active ? 2 : 1,
              borderColor: active ? colors.brand : colors.separatorOpaque,
              backgroundColor: active ? colors.brandPale : colors.card,
              borderRadius: 14,
              padding: 18,
              position: 'relative',
              overflow: 'visible',
            }}
          >
            {plan.badge && (
              <View
                style={{
                  position: 'absolute',
                  top: -9,
                  right: 16,
                  backgroundColor: colors.badgeRecurring,
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 2,
                }}
              >
                <Text className="text-[10px] font-bold text-white tracking-[0.3px]">
                  {plan.badge}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-[16px] font-semibold text-ink">{plan.label}</Text>
                <Text className="text-[13px] text-secondary mt-[2px]">
                  {plan.description}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[24px] font-bold text-ink">{plan.price}</Text>
                <Text className="text-[12px] text-tertiary">{plan.period}</Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
