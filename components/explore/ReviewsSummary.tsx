import { Text, View } from 'react-native';
import StarRow from '@/components/ui/StarRow';
import Icon from '@/components/ui/Icon';
import { useColors } from '@/lib/theme/colors';

interface ReviewsSummaryProps {
  averageRating: number;
  totalReviews: number;
}

export default function ReviewsSummary({
  averageRating,
  totalReviews,
}: ReviewsSummaryProps) {
  const colors = useColors();
  return (
    <View className="flex-row items-center gap-3 mb-lg">
      <View className="items-center">
        <Text className="text-[36px] font-extrabold text-ink tracking-[-1px]">
          {averageRating > 0 ? averageRating.toFixed(1) : '—'}
        </Text>
      </View>
      <View className="flex-1">
        <StarRow value={Math.round(averageRating)} size={16} color={colors.star} />
        <View className="flex-row items-center gap-[4px] mt-[4px]">
          <Icon name="user" size={12} color={colors.tertiary} />
          <Text className="text-[13px] text-tertiary">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </Text>
        </View>
      </View>
    </View>
  );
}
