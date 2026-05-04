import { useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import TabBar from '@/components/ui/TabBar';
import UpcomingBookingCard from '@/components/booking/UpcomingBookingCard';
import PastBookingCard from '@/components/booking/PastBookingCard';
import RecurringBookingCard from '@/components/booking/RecurringBookingCard';
import EmptyState from '@/components/feedback/EmptyState';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import {
  useUpcomingBookings,
  usePastBookings,
  useRecurringBookingsList,
} from '@/lib/hooks/useBookings';
import { useFiltersStore, useBookingsTab } from '@/lib/stores/filters';
import type { UpcomingBooking, PastBooking, ClientRecurringBooking } from '@/lib/api/bookings';

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

      {tab === 'Upcoming' && <UpcomingList />}
      {tab === 'Past' && <PastList />}
      {tab === 'Recurring' && <RecurringList />}
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
          durationMinutes={item.durationMinutes}
          status={item.status}
          isRecurring={item.isRecurring}
          onPress={() => router.push(`/(app)/(tabs)/bookings/${item.id}`)}
        />
      </View>
    ),
    [router],
  );

  if (isLoading) return <LoadingSpinner />;
  if (bookings.length === 0)
    return (
      <EmptyState
        icon="calendar"
        title="No upcoming bookings"
        subtitle="Book an appointment with a barber to get started."
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
      contentContainerClassName="pb-6"
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
            !item.hasReview
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

  if (isLoading) return <LoadingSpinner />;
  if (bookings.length === 0)
    return (
      <EmptyState
        icon="clock"
        title="No past bookings"
        subtitle="Completed appointments will show up here."
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
      contentContainerClassName="pb-6"
    />
  );
}

function RecurringList() {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRecurringBookingsList();
  const bookings = data?.pages.flatMap((p) => p.bookings) ?? [];

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

  if (isLoading) return <LoadingSpinner />;
  if (bookings.length === 0)
    return (
      <EmptyState
        icon="repeat"
        title="No recurring bookings"
        subtitle="Set up a recurring slot with your barber from their profile."
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
      contentContainerClassName="pb-6"
    />
  );
}
