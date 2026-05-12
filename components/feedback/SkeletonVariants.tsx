import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonRow,
  SkeletonCard,
} from './Skeleton';

export function BookingCardSkeleton() {
  return (
    <View className="bg-card rounded-lg p-4 gap-3">
      <SkeletonRow />
      <SkeletonText width="80%" />
    </View>
  );
}

export function BarberCardSkeleton() {
  return (
    <View className="bg-card rounded-lg p-4 gap-3">
      <View className="flex-row items-center gap-3">
        <SkeletonAvatar size={48} />
        <View className="flex-1 gap-2">
          <SkeletonText width="50%" />
          <SkeletonText width="35%" height={12} />
        </View>
      </View>
      <SkeletonText width="40%" height={12} />
    </View>
  );
}

export function ConversationRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3 py-3 px-5">
      <SkeletonAvatar size={44} />
      <View className="flex-1 gap-2">
        <SkeletonText width="55%" />
        <SkeletonText width="75%" height={12} />
      </View>
    </View>
  );
}

export function HomeHeaderSkeleton() {
  return (
    <View className="gap-2 px-5">
      <SkeletonText width="50%" height={24} />
      <SkeletonText width="30%" height={16} />
    </View>
  );
}

export function NextBookingCardSkeleton() {
  return (
    <View className="bg-card rounded-lg p-4 gap-3">
      <SkeletonText width="40%" height={12} />
      <SkeletonRow />
      <SkeletonText width="60%" />
    </View>
  );
}

export function BookingDetailSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-bg px-5" edges={['top']}>
      <View className="gap-4 mt-4">
        <SkeletonText width="50%" height={20} />
        <SkeletonCard height={180} />
        <SkeletonText width="30%" height={18} />
        <SkeletonText width="90%" />
        <SkeletonText width="70%" />
        <SkeletonText width="80%" />
      </View>
    </SafeAreaView>
  );
}

export function ProfileSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-bg items-center px-5" edges={['top']}>
      <View className="items-center gap-3 mt-8 w-full">
        <SkeletonAvatar size={72} />
        <SkeletonText width="40%" />
        <SkeletonText width="55%" height={12} />
      </View>
      <View className="gap-3 mt-8 w-full">
        <SkeletonCard height={60} />
        <SkeletonCard height={60} />
        <SkeletonCard height={60} />
        <SkeletonCard height={60} />
      </View>
    </SafeAreaView>
  );
}

export function BarberDetailSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-bg px-5" edges={['top']}>
      <View className="items-center gap-3 mt-4">
        <SkeletonAvatar size={64} />
        <SkeletonText width="60%" />
      </View>
      <View className="gap-3 mt-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    </SafeAreaView>
  );
}

export function MessageBubbleSkeleton({
  alignEnd,
}: {
  alignEnd?: boolean;
}) {
  return (
    <Skeleton
      width="60%"
      height={44}
      borderRadius={16}
      className={alignEnd ? 'self-end' : 'self-start'}
    />
  );
}

export function MessagesListSkeleton() {
  return (
    <View className="gap-3 px-4 pt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <MessageBubbleSkeleton key={i} alignEnd={i % 2 === 1} />
      ))}
    </View>
  );
}
