import { useCallback } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import TabBar from '@/components/ui/TabBar';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import UpcomingBookingCard from '@/components/booking/UpcomingBookingCard';
import PastBookingCard from '@/components/booking/PastBookingCard';
import RecurringBookingCard from '@/components/booking/RecurringBookingCard';
import EmptyState from '@/components/feedback/EmptyState';
import { BookingCardSkeleton } from '@/components/feedback/SkeletonVariants';
import {
  useUpcomingBookings,
  usePastBookings,
  useRecurringBookingsList,
} from '@/lib/hooks/useBookings';
import { usePendingArrangements } from '@/lib/hooks/useArrangements';
import { useFiltersStore, useBookingsTab } from '@/lib/stores/filters';
import { formatCurrency, formatTime } from '@/lib/utils/format';
import type { UpcomingBooking, PastBooking, ClientRecurringBooking } from '@/lib/api/bookings';
import type { Arrangement } from '@/lib/api/arrangements';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  every_n_weeks: 'Custom',
  monthly: 'Monthly',
};

const TABS = ['Upcoming', 'Past', 'Recurring'] as const;

export default function BookingsScreen() {
  const router = useRouter();
  const tab = useBookingsTab();
  const setTab = useFiltersStore((s) => s.setBookingsTab);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5 pt-2">
        <Header title="Bookings" />
        <TabBar tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as typeof tab)} />
      </View>

      <Animated.View key={tab} entering={FadeIn.duration(200)} className="flex-1">
        {tab === 'Upcoming' && <UpcomingList />}
        {tab === 'Past' && <PastList />}
        {tab === 'Recurring' && <RecurringList />}
      </Animated.View>
    </SafeAreaView>
  );
}

function UpcomingList() {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUpcomingBookings();
  const bookings = data?.pages.flatMap((p) => p.bookings) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: UpcomingBooking }) => (
      <View className="px-5">
        <UpcomingBookingCard
          barberName={item.barberName}
          barberProfileImage={item.barberProfileImage}
          serviceName={item.serviceName}
          appointmentDate={item.appointmentDate}
          appointmentTime={item.appointmentTime}
          totalDurationMinutes={item.totalDurationMinutes}
          services={item.services}
          status={item.status}
          isRecurring={item.isRecurring}
          onPress={() => router.push(`/(app)/(tabs)/bookings/${item.id}`)}
        />
      </View>
    ),
    [router],
  );

  if (isLoading)
    return (
      <View className="px-5 gap-3 mt-4">
        {[1, 2, 3].map((i) => <BookingCardSkeleton key={i} />)}
      </View>
    );
  if (bookings.length === 0)
    return (
      <EmptyState
        icon="calendar"
        title="No upcoming bookings"
        body="Book an appointment with a barber to get started."
        cta={{ label: 'Find a barber', onPress: () => router.push('/(app)/(tabs)/explore') }}
      />
    );

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      contentContainerClassName="pb-8"
    />
  );
}

function PastList() {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePastBookings();
  const bookings = data?.pages.flatMap((p) => p.bookings) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: PastBooking }) => (
      <View className="px-5">
        <PastBookingCard
          barberName={item.barberName}
          barberProfileImage={item.barberProfileImage}
          serviceName={item.serviceName}
          appointmentDate={item.appointmentDate}
          appointmentTime={item.appointmentTime}
          pricePaid={item.pricePaid}
          hasReview={item.hasReview}
          onPress={() => router.push(`/(app)/(tabs)/bookings/${item.id}`)}
          onReview={
            !item.hasReview && (item.status === 'completed' || item.status === undefined)
              ? () =>
                  router.push({
                    pathname: '/(app)/(tabs)/bookings/review',
                    params: { bookingId: item.id },
                  })
              : undefined
          }
        />
      </View>
    ),
    [router],
  );

  if (isLoading)
    return (
      <View className="px-5 gap-3 mt-4">
        {[1, 2, 3].map((i) => <BookingCardSkeleton key={i} />)}
      </View>
    );
  if (bookings.length === 0)
    return (
      <EmptyState
        icon="clock"
        title="No past bookings"
        body="Completed appointments will show up here."
      />
    );

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      contentContainerClassName="pb-8"
    />
  );
}

function PendingArrangementCard({ item }: { item: Arrangement }) {
  const router = useRouter();
  const freq =
    item.frequency === 'every_n_weeks' && item.intervalN
      ? `Every ${item.intervalN} weeks`
      : FREQUENCY_LABELS[item.frequency] ?? item.frequency;

  return (
    <View className="px-5 mb-3">
      <Card
        className="p-4 border border-yellow/40 bg-yellow/5"
        onPress={() =>
          router.push(`/(app)/(tabs)/bookings/arrangements/${item.id}`)
        }
      >
        <View className="flex-row items-center gap-2 mb-3">
          <Icon name="repeat" size={12} />
          <Text className="text-[11px] font-bold uppercase tracking-wide text-yellow">
            Offer from barber · Action needed
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Avatar
            name={item.barber.name}
            size={40}
            uri={item.barber.avatarUrl ?? undefined}
          />
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-ink tracking-[-0.2px]">
              {item.barber.name}
            </Text>
            <Text className="text-[12px] text-tertiary mt-[2px]" numberOfLines={1}>
              {item.services.map((s) => s.name).join(', ')}
            </Text>
            <Text className="text-[12px] text-secondary mt-1">
              {DAY_NAMES_SHORT[item.dayOfWeek]} {formatTime(item.timeOfDay)} · {freq} · {formatCurrency(item.priceUsd)}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

function RecurringList() {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRecurringBookingsList();
  const { data: pendingData } = usePendingArrangements();
  const bookings = data?.pages.flatMap((p) => p.bookings) ?? [];
  const pending = pendingData?.pages.flatMap((p) => p.arrangements) ?? [];

  const renderItem = useCallback(
    ({ item }: { item: ClientRecurringBooking }) => (
      <View className="px-5">
        <RecurringBookingCard
          barberName={item.barberName}
          barberProfileImage={item.barberProfileImage}
          serviceName={item.serviceName}
          nextAppointmentDate={item.nextAppointmentDate}
          appointmentTime={item.appointmentTime}
          durationMinutes={item.durationMinutes}
          recurringStatus={item.recurringStatus}
          appointmentsLeft={item.appointmentsLeft}
          onPress={() =>
            router.push(`/(app)/(tabs)/bookings/recurring/${item.id}`)
          }
        />
      </View>
    ),
    [router],
  );

  const PendingHeader = pending.length > 0 ? (
    <View>
      <View className="flex-row items-center justify-between px-5 mt-3 mb-2">
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-tertiary">
          Pending offers ({pending.length})
        </Text>
        <Pressable
          onPress={() =>
            router.push('/(app)/(tabs)/bookings/arrangements/pending')
          }
          className="active:opacity-70"
          accessibilityRole="button"
        >
          <Text className="text-[13px] font-medium text-brand">See all</Text>
        </Pressable>
      </View>
      {pending.slice(0, 3).map((item) => (
        <PendingArrangementCard key={item.id} item={item} />
      ))}
      {bookings.length > 0 && (
        <Text className="px-5 mt-2 mb-2 text-[13px] font-semibold uppercase tracking-wide text-tertiary">
          Your recurring
        </Text>
      )}
    </View>
  ) : null;

  if (isLoading)
    return (
      <View className="px-5 gap-3 mt-4">
        {[1, 2, 3].map((i) => <BookingCardSkeleton key={i} />)}
      </View>
    );

  if (bookings.length === 0 && pending.length === 0)
    return (
      <EmptyState
        icon="repeat"
        title="No recurring bookings"
        body="Set up a recurring slot with your barber from their profile."
        cta={{ label: 'Find a barber', onPress: () => router.push('/(app)/(tabs)/explore') }}
      />
    );

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={PendingHeader}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      contentContainerClassName="pb-8"
    />
  );
}
