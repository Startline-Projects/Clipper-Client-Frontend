import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import { useColors } from '@/lib/theme/colors';
import { categoryLabel } from '@/lib/utils/categories';
import type { BarberCategoryTag } from '@/lib/schemas/enums';

interface BarberCardProps {
  name: string;
  profileImage: string | null;
  averageRating: number;
  totalReviews: number;
  distance: { km: number; miles: number };
  recurringAvailable: boolean;
  categories?: BarberCategoryTag[];
  topServices: { name: string }[];
  onPress?: () => void;
}

const MAX_VISIBLE_CATEGORIES = 3;

export default memo(function BarberCard({
  name,
  profileImage,
  averageRating,
  totalReviews,
  distance,
  recurringAvailable,
  categories = [],
  topServices,
  onPress,
}: BarberCardProps) {
  const colors = useColors();
  const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const extraCategories = categories.length - visibleCategories.length;

  return (
    <Pressable
      onPress={onPress}
      className="bg-card rounded-lg mb-sm shadow-sm shadow-black/6 active:opacity-80 overflow-hidden"
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${averageRating.toFixed(1)} stars, ${distance.miles} miles away`}
    >
      <View className="flex-row gap-[14px] p-4">
        <Avatar
          name={name}
          size={68}
          radius={16}
          uri={profileImage ?? undefined}
        />

        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-[16px] font-semibold text-ink tracking-[-0.2px]">
              {name}
            </Text>
            {recurringAvailable && (
              <Badge
                label="Recurring"
                color={colors.badgeRecurring}
                bg={colors.badgeRecurringBg}
              />
            )}
          </View>

          <View className="flex-row items-center gap-[5px] mt-[5px]">
            <Icon name="star" size={12} color={colors.star} />
            <Text className="text-[13px] font-semibold text-ink">
              {averageRating.toFixed(1)}
            </Text>
            <Text className="text-[12px] text-tertiary">
              ({totalReviews})
            </Text>
            <View className="flex-row items-center gap-[3px] ml-[6px]">
              <Icon name="location" size={11} color={colors.tertiary} />
              <Text className="text-[12px] text-tertiary">
                {distance.miles} mi
              </Text>
            </View>
          </View>

          <Text
            className="text-[13px] text-secondary mt-[5px]"
            numberOfLines={1}
          >
            {topServices.map((s) => s.name).join(' · ')}
          </Text>

          {visibleCategories.length > 0 && (
            <View className="flex-row flex-wrap gap-[5px] mt-[8px]">
              {visibleCategories.map((tag) => (
                <View
                  key={tag}
                  style={{ backgroundColor: colors.bgWarm }}
                  className="rounded-full px-[8px] py-[3px]"
                >
                  <Text className="text-[11px] font-medium text-secondary tracking-[-0.1px]">
                    {categoryLabel(tag)}
                  </Text>
                </View>
              ))}
              {extraCategories > 0 && (
                <View
                  style={{ backgroundColor: colors.bgWarm }}
                  className="rounded-full px-[8px] py-[3px]"
                >
                  <Text className="text-[11px] font-medium text-tertiary tracking-[-0.1px]">
                    +{extraCategories}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
})
