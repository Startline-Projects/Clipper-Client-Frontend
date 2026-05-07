import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Badge from '@/components/ui/Badge';
import Section from '@/components/ui/Section';
import TypeBadge from '@/components/ui/TypeBadge';
import Avatar from '@/components/ui/Avatar';
import WorkingHoursTable from '@/components/explore/WorkingHoursTable';
import ReviewsSummary from '@/components/explore/ReviewsSummary';
import ReviewCard from '@/components/explore/ReviewCard';
import { BarberDetailSkeleton } from '@/components/feedback/SkeletonVariants';
import ErrorView from '@/components/feedback/ErrorView';
import { useBarberDetail } from '@/lib/hooks/useBarbers';
import { useBarberChat } from '@/lib/hooks/useBarberChat';
import { useLocation } from '@/lib/hooks/useLocation';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useColors } from '@/lib/theme/colors';
import { formatCurrency } from '@/lib/utils/format';

export default function BarberDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { barberId } = useLocalSearchParams<{ barberId: string }>();
  const { latitude, longitude } = useLocation();
  const coords =
    latitude !== null && longitude !== null
      ? { latitude, longitude }
      : null;
  const { data, isLoading, isError, error, refetch } = useBarberDetail(barberId, coords);

  const barberName = data?.barber?.name ?? '';
  const { openChat, isPending: chatPending } = useBarberChat(barberId, barberName);
  const { data: subscription } = useSubscription();
  const isSubscribed =
    subscription?.status === 'active' || subscription?.status === 'past_due';

  if (isLoading) return <BarberDetailSkeleton />;
  if (isError || !data) return <ErrorView error={error} onRetry={refetch} />;

  const { barber, services, reviews, reviewsSummary, distance } = data;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        <View className="px-5">
          <Header
            title={barber.name}
            onBack={() => router.back()}
            right={
              <Pressable
                onPress={openChat}
                disabled={chatPending}
                className="w-9 h-9 rounded-full bg-bg-warm items-center justify-center active:opacity-70"
              >
                <Icon name="chat" size={18} color={colors.ink} />
              </Pressable>
            }
          />
        </View>

        <View className="items-center px-5 mt-2 mb-4">
          <Avatar
            name={barber.name}
            size={80}
            uri={barber.profileImage ?? undefined}
          />
          <Text className="text-[22px] font-bold text-ink tracking-[-0.5px] mt-3">
            {barber.name}
          </Text>
          <View className="flex-row items-center gap-[5px] mt-[4px]">
            <Icon name="star" size={13} color="#F5A623" />
            <Text className="text-[14px] font-semibold text-ink">
              {reviewsSummary.averageRating > 0
                ? reviewsSummary.averageRating.toFixed(1)
                : '—'}
            </Text>
            <Text className="text-[13px] text-secondary">
              · {reviewsSummary.totalReviews} reviews
            </Text>
            <Text className="text-[13px] text-tertiary ml-1">
              {distance.miles} mi
            </Text>
          </View>

          {barber.bio && (
            <Text className="text-[14px] text-secondary text-center leading-[21px] tracking-[-0.1px] mt-3 px-2">
              {barber.bio}
            </Text>
          )}

          <View className="flex-row gap-[14px] flex-wrap mt-2">
            {barber.address && (
              <Pressable
                onPress={() =>
                  Linking.openURL(
                    `https://maps.google.com/?q=${encodeURIComponent(barber.address!)}`,
                  )
                }
                className="flex-row items-center gap-1 active:opacity-70"
              >
                <Icon name="location" size={12} color={colors.tertiary} />
                <Text className="text-[12px] text-tertiary underline">
                  {barber.address}
                </Text>
              </Pressable>
            )}
            {barber.phone && (
              <Pressable
                onPress={() => Linking.openURL(`tel:${barber.phone}`)}
                className="flex-row items-center gap-1 active:opacity-70"
              >
                <Icon name="phone" size={12} color={colors.tertiary} />
                <Text className="text-[12px] text-tertiary underline">
                  {barber.phone}
                </Text>
              </Pressable>
            )}
          </View>

          {barber.recurringAvailable && (
            <Card
              className="mt-4 p-[14px] mb-0 border-0 shadow-none"
              style={{
                backgroundColor: '#1A1200',
                borderLeftWidth: 3,
                borderLeftColor: '#C47F17',
              }}
            >
              <View className="flex-row items-center gap-2">
                <Icon name="repeat" size={16} color="#C47F17" />
                <View>
                  <Text className="text-[14px] font-semibold" style={{ color: '#C47F17' }}>
                    Recurring slots available
                  </Text>
                  <Text className="text-[12px] text-secondary mt-[2px]">
                    Lock in a weekly or biweekly appointment
                  </Text>
                </View>
              </View>
            </Card>
          )}

          <View className="flex-row gap-[10px] mt-[18px] w-full">
            <View className="flex-1">
              <Btn
                label="Book Now"
                full
                onPress={() =>
                  isSubscribed
                    ? router.push(`/(app)/(tabs)/explore/${barberId}/availability`)
                    : router.push('/(app)/paywall')
                }
              />
            </View>
            {barber.recurringAvailable && (
              <View className="flex-1">
                <Btn
                  label="Recurring Slot"
                  variant="secondary"
                  full
                  onPress={() =>
                    isSubscribed
                      ? router.push(`/(app)/(tabs)/explore/${barberId}/recurring-services`)
                      : router.push('/(app)/paywall')
                  }
                />
              </View>
            )}
          </View>
        </View>

        <View className="px-5 mt-7">
          <Section title="Services">
            {services.map((s) => (
              <Card key={s.id} className="mb-[10px] flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <Text className="text-[15px] font-semibold text-ink shrink">
                      {s.name}
                    </Text>
                    <TypeBadge type={s.serviceType} />
                  </View>
                  <View className="flex-row items-center gap-1 mt-1">
                    <Icon name="clock" size={11} color={colors.tertiary} />
                    <Text className="text-[12px] text-tertiary">
                      {s.durationMinutes} min
                    </Text>
                  </View>
                </View>
                <Text className="text-[17px] font-bold text-brand shrink-0">
                  {formatCurrency(s.regularPrice)}
                </Text>
              </Card>
            ))}
          </Section>

          <Section title="Working Hours">
            <WorkingHoursTable hours={barber.workingHours} />
          </Section>

          {reviews.length > 0 && (
            <Section
              title="Reviews"
              action="See All"
              onAction={() =>
                router.push(`/(app)/(tabs)/explore/${barberId}/reviews`)
              }
            >
              <ReviewsSummary
                averageRating={reviewsSummary.averageRating}
                totalReviews={reviewsSummary.totalReviews}
              />
              {reviews.slice(0, 3).map((r) => (
                <ReviewCard
                  key={r.id}
                  reviewerName={r.reviewerName}
                  reviewerImage={r.reviewerProfileImage}
                  rating={r.rating}
                  comment={r.comment}
                  createdAt={r.createdAt}
                />
              ))}
            </Section>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
