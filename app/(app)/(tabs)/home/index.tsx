import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@/components/ui/Icon';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import NextBookingCard from '@/components/booking/NextBookingCard';
import SubscriptionStatusCard from '@/components/subscription/SubscriptionStatusCard';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import { useProfile } from '@/lib/hooks/useProfile';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useUnreadCount } from '@/lib/hooks/useNotifications';
import { useColors } from '@/lib/theme/colors';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: subscription } = useSubscription();
  const { data: unreadCount } = useUnreadCount();

  const hasUnread = typeof unreadCount === 'number' && unreadCount > 0;
  const isSubscribed =
    subscription?.status === 'active' || subscription?.status === 'past_due';

  if (profileLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        <View className="px-5 pt-2 pb-4">
          <View className="flex-row items-center justify-between mb-[18px]">
            <View>
              <Text className="text-[14px] text-secondary tracking-[-0.1px]">
                {getGreeting()}
              </Text>
              <Text className="text-[26px] font-bold text-ink tracking-[-0.6px] mt-[2px]">
                Home
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(app)/(tabs)/home/notifications')}
              className="w-10 h-10 rounded-full bg-bg-warm items-center justify-center"
            >
              <Icon name="bell" size={19} color={colors.ink} />
              {hasUnread && (
                <View className="absolute top-[8px] right-[8px] w-2 h-2 rounded-full bg-red" />
              )}
            </Pressable>
          </View>

          {!isSubscribed && (
            <Card className="mb-4 p-[18px]" style={{ borderLeftWidth: 3, borderLeftColor: colors.brand }}>
              <Text className="text-[15px] font-semibold text-ink tracking-[-0.2px]">
                Subscribe to start booking
              </Text>
              <Text className="text-[13px] text-secondary mt-1 leading-[18px]">
                A subscription is required to book appointments with barbers.
              </Text>
              <View className="mt-3">
                <Btn
                  label="View Plans"
                  variant="primary"
                  onPress={() => router.push('/(app)/paywall')}
                />
              </View>
            </Card>
          )}

          {profile?.nextUpcomingBooking && (
            <View className="mb-4">
              <Text className="text-[13px] font-semibold text-secondary mb-[8px] tracking-[-0.1px]">
                Next appointment
              </Text>
              <NextBookingCard
                barberName={profile.nextUpcomingBooking.barberName}
                barberProfileImage={profile.nextUpcomingBooking.barberProfileImage}
                serviceName={profile.nextUpcomingBooking.serviceName}
                appointmentDate={profile.nextUpcomingBooking.appointmentDate}
                appointmentTime={profile.nextUpcomingBooking.appointmentTime}
                durationMinutes={profile.nextUpcomingBooking.durationMinutes}
                status={profile.nextUpcomingBooking.status}
                isRecurring={profile.nextUpcomingBooking.isRecurring}
                onPress={() =>
                  router.push(
                    `/(app)/(tabs)/bookings/${profile.nextUpcomingBooking!.id}`,
                  )
                }
              />
            </View>
          )}

          {isSubscribed && subscription?.plan && subscription.currentPeriodEnd && (
            <SubscriptionStatusCard
              plan={subscription.plan}
              currentPeriodEnd={subscription.currentPeriodEnd}
              cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
            />
          )}

          <Text className="text-[13px] font-semibold text-secondary mb-[8px] mt-2 tracking-[-0.1px]">
            Quick actions
          </Text>
          <View className="flex-row gap-3">
            <Card
              className="flex-1 items-center py-5"
              onPress={() => router.push('/(app)/(tabs)/explore')}
            >
              <View className="w-11 h-11 rounded-full bg-brand-pale items-center justify-center mb-[10px]">
                <Icon name="compass" size={20} color={colors.brand} />
              </View>
              <Text className="text-[14px] font-semibold text-ink tracking-[-0.1px]">
                Find a Barber
              </Text>
            </Card>

            <Card
              className="flex-1 items-center py-5"
              onPress={() => router.push('/(app)/(tabs)/bookings')}
            >
              <View className="w-11 h-11 rounded-full bg-brand-pale items-center justify-center mb-[10px]">
                <Icon name="bookings" size={20} color={colors.brand} />
              </View>
              <Text className="text-[14px] font-semibold text-ink tracking-[-0.1px]">
                My Bookings
              </Text>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
