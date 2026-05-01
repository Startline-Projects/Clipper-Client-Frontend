import { Image, Pressable, Text, View } from 'react-native';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import { useColors } from '@/lib/theme/colors';

interface BarberCardProps {
  name: string;
  profileImage: string | null;
  averageRating: number;
  totalReviews: number;
  distance: { km: number; miles: number };
  recurringAvailable: boolean;
  topServices: { name: string }[];
  onPress?: () => void;
}

export default function BarberCard({
  name,
  profileImage,
  averageRating,
  totalReviews,
  distance,
  recurringAvailable,
  topServices,
  onPress,
}: BarberCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      className="bg-card rounded-lg mb-sm shadow-sm shadow-black/6 active:opacity-80 overflow-hidden"
    >
      <View className="flex-row gap-[14px] p-4">
        <View
          style={{ width: 68, height: 68, borderRadius: 16, overflow: 'hidden' }}
          className="bg-bgMuted shrink-0"
        >
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={{ width: 68, height: 68 }}
            />
          ) : (
            <Avatar name={name} size={68} />
          )}
        </View>

        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-[16px] font-semibold text-ink tracking-[-0.2px]">
              {name}
            </Text>
            {recurringAvailable && (
              <Badge
                label="Recurring"
                color="#C47F17"
                bg="#FDF3E0"
              />
            )}
          </View>

          <View className="flex-row items-center gap-[5px] mt-[5px]">
            <Icon name="star" size={12} color="#F5A623" />
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
        </View>
      </View>
    </Pressable>
  );
}
