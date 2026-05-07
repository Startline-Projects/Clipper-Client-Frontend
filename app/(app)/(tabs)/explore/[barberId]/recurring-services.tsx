import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { SkeletonList } from '@/components/feedback/Skeleton';
import { useRecurringServices } from '@/lib/hooks/useRecurring';
import { useColors } from '@/lib/theme/colors';
import { formatCurrency } from '@/lib/utils/format';
import type { RecurringService } from '@/lib/api/recurring';

const MAX_SERVICES = 4;

export default function RecurringServicesScreen() {
  const router = useRouter();
  const colors = useColors();
  const { barberId } = useLocalSearchParams<{ barberId: string }>();
  const { data, isLoading } = useRecurringServices(barberId);
  const [selected, setSelected] = useState<string[]>([]);

  const services = data?.services ?? [];

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_SERVICES) return prev;
      return [...prev, id];
    });
  };

  const totalDuration = services
    .filter((s) => selected.includes(s.id))
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="Recurring Booking" onBack={() => router.back()} />
      </View>

      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        <Text className="text-[22px] font-bold text-ink tracking-[-0.5px] mt-1 mb-[2px]">
          Pick a service
        </Text>
        <Text className="text-[14px] text-secondary mb-4">
          Up to {MAX_SERVICES} — recurring price shown is the lowest across all days.{' '}
          {selected.length}/{MAX_SERVICES} selected
          {totalDuration > 0 ? ` · ${totalDuration} min` : ''}
        </Text>

        {isLoading ? (
          <SkeletonList count={4} height={72} />
        ) : (
          <View className="gap-[10px]">
            {services.map((s) => {
              const isSelected = selected.includes(s.id);
              const isDisabled = !isSelected && selected.length >= MAX_SERVICES;
              const savings = s.regularPrice - s.recurringPriceFrom;

              return (
                <Pressable
                  key={s.id}
                  onPress={() => !isDisabled && toggle(s.id)}
                  style={{
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? '#C47F17' : colors.separatorOpaque,
                    backgroundColor: isSelected ? '#FFF8ED' : colors.card,
                    opacity: isDisabled ? 0.4 : 1,
                  }}
                  className="rounded-lg p-4 active:opacity-70"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1 min-w-0">
                      <Text className="text-[15px] font-semibold text-ink tracking-[-0.2px]">
                        {s.name}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-[5px]">
                        <View className="flex-row items-center gap-[3px]">
                          <Icon name="clock" size={11} color={colors.tertiary} />
                          <Text className="text-[12px] text-tertiary">
                            {s.durationMinutes} min
                          </Text>
                        </View>
                        {savings > 0 && (
                          <Text className="text-[11px] font-semibold text-green">
                            Save {formatCurrency(savings)}+
                          </Text>
                        )}
                      </View>
                    </View>
                    <View className="items-end gap-[2px]">
                      <Text className="text-[11px] text-tertiary">From</Text>
                      <Text
                        className="text-[18px] font-bold tracking-[-0.3px]"
                        style={{ color: '#C47F17' }}
                      >
                        {formatCurrency(s.recurringPriceFrom)}
                      </Text>
                      {savings > 0 && (
                        <Text className="text-[11px] text-tertiary line-through">
                          {formatCurrency(s.regularPrice)}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View className="mt-6">
          <Btn
            label="Next — Choose Day & Time"
            full
            onPress={() =>
              router.push({
                pathname: '/(app)/(tabs)/explore/[barberId]/recurring-slots',
                params: { barberId, serviceIds: selected.join(',') },
              })
            }
            disabled={selected.length === 0}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
