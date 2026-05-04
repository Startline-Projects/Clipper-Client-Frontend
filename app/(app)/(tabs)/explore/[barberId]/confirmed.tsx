import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@/components/ui/Icon';
import Btn from '@/components/ui/Btn';
import { useColors } from '@/lib/theme/colors';

export default function ConfirmedScreen() {
  const router = useRouter();
  const colors = useColors();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-[72px] h-[72px] rounded-full bg-green/10 items-center justify-center mb-5">
          <Icon name="check" size={36} color={colors.green} />
        </View>

        <Text className="text-[24px] font-extrabold text-ink tracking-[-0.6px] mb-2">
          Booking Submitted
        </Text>
        <Text className="text-[14px] text-secondary text-center leading-[21px] tracking-[-0.1px] mb-8 px-4">
          Your appointment has been submitted. You'll get a notification once
          your barber confirms.
        </Text>

        <View className="w-full gap-[10px]">
          {bookingId && (
            <Btn
              label="View Booking"
              full
              onPress={() =>
                router.replace(`/(app)/(tabs)/bookings/${bookingId}`)
              }
            />
          )}
          <Btn
            label="Back to Home"
            variant="secondary"
            full
            onPress={() => router.replace('/(app)/(tabs)/home')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
