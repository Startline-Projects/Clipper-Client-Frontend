import { useCallback, memo } from 'react';
import { FlatList, InteractionManager, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Icon from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import EmptyState from '@/components/feedback/EmptyState';
import { ConversationRowSkeleton } from '@/components/feedback/SkeletonVariants';
import { useNotifications, useMarkNotificationRead, useClearAllNotifications } from '@/lib/hooks/useNotifications';
import { useColors } from '@/lib/theme/colors';
import { formatRelativeTime } from '@/lib/utils/format';
import type { Notification } from '@/lib/api/notifications';

const NOTIFICATION_ICON: Record<string, IconName> = {
  booking_confirmed: 'check',
  booking_cancelled: 'x',
  recurring_accepted: 'repeat',
  recurring_refused: 'x',
  recurring_expiring: 'alert',
  recurring_paused: 'pause',
  recurring_resumed: 'repeat',
  new_message: 'chat',
};

const NotificationSeparator = memo(() => (
  <View className="h-px bg-separator ml-[68px]" />
));

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications();
  const markRead = useMarkNotificationRead();
  const clearAll = useClearAllNotifications();

  const notifications = data?.pages.flatMap((p) => p.notifications) ?? [];

  const handlePress = useCallback(
    (notification: Notification) => {
      if (!notification.isRead) markRead.mutate(notification.id);

      if (notification.bookingId) {
        router.push(`/(app)/(tabs)/bookings/${notification.bookingId}`);
      } else if (notification.recurringBookingId) {
        router.push(
          `/(app)/(tabs)/bookings/recurring/${notification.recurringBookingId}`,
        );
      } else if (notification.conversationId) {
        router.navigate('/(app)/(tabs)/messages');
        InteractionManager.runAfterInteractions(() => {
          router.push(
            `/(app)/(tabs)/messages/${notification.conversationId}`,
          );
        });
      }
    },
    [markRead, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => {
      const iconName = NOTIFICATION_ICON[item.type] ?? 'bell';

      return (
        <Pressable
          onPress={() => handlePress(item)}
          className="px-5 py-[14px] active:bg-bg-hover"
          accessibilityRole="button"
          accessibilityLabel={`${item.title}${!item.isRead ? ', unread' : ''}`}
          style={
            !item.isRead
              ? { borderLeftWidth: 3, borderLeftColor: colors.brand }
              : undefined
          }
        >
          <View className="flex-row gap-3">
            <View className="w-9 h-9 rounded-full bg-bg-warm items-center justify-center mt-[2px]">
              <Icon name={iconName} size={16} color={colors.secondary} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-start justify-between gap-2">
                <Text
                  className={`flex-1 text-[14px] tracking-[-0.1px] ${
                    item.isRead
                      ? 'font-medium text-ink'
                      : 'font-semibold text-ink'
                  }`}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="text-[11px] text-tertiary">
                  {formatRelativeTime(item.createdAt)}
                </Text>
              </View>
              <Text
                className="text-[12px] text-secondary mt-1 leading-[17px]"
                numberOfLines={2}
              >
                {item.body}
              </Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [handlePress, colors],
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header
          title="Notifications"
          onBack={() => router.back()}
          right={
            notifications.length > 0 ? (
              <Pressable
                onPress={() => clearAll.mutate()}
                disabled={clearAll.isPending}
                className="active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel="Clear all notifications"
              >
                <Text className="text-[14px] font-medium text-red">
                  Clear All
                </Text>
              </Pressable>
            ) : undefined
          }
        />
      </View>

      {isLoading ? (
        <View>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ConversationRowSkeleton key={i} />
          ))}
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="bell"
          title="No notifications yet"
          body="When you get booking updates or messages, they'll show up here."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ItemSeparatorComponent={NotificationSeparator}
        />
      )}
    </SafeAreaView>
  );
}
