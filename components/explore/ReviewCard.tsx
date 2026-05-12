import { memo } from 'react';
import { Text, View } from 'react-native';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import { useColors } from '@/lib/theme/colors';
import { formatRelativeTime } from '@/lib/utils/format';

interface ReviewCardProps {
  reviewerName: string;
  reviewerImage?: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export default memo(function ReviewCard({
  reviewerName,
  reviewerImage,
  rating,
  comment,
  createdAt,
}: ReviewCardProps) {
  const colors = useColors();

  return (
    <Card className="mb-[10px]">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-[10px]">
          <Avatar name={reviewerName} size={32} uri={reviewerImage ?? undefined} />
          <Text className="text-[14px] font-semibold text-ink tracking-[-0.1px]">
            {reviewerName}
          </Text>
        </View>
        <View className="flex-row gap-[2px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <Icon
              key={i}
              name="star"
              size={11}
              color={i <= rating ? colors.star : colors.bgMuted}
            />
          ))}
        </View>
      </View>

      {comment && (
        <Text className="text-[13px] text-secondary mt-2 leading-[19px] tracking-[-0.1px]">
          {comment}
        </Text>
      )}

      <Text className="text-[11px] text-tertiary mt-[6px]">
        {formatRelativeTime(createdAt)}
      </Text>
    </Card>
  );
})
