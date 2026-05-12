import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import ErrorView from '@/components/feedback/ErrorView';
import StripePaymentIntentSheet from '@/components/stripe/StripePaymentIntentSheet';
import { useClientNoShows, usePayNoShow } from '@/lib/hooks/useNoShows';
import { useColors } from '@/lib/theme/colors';
import { showErrorToast, showSuccessToast, showToast } from '@/lib/feedback/toast';
import { formatCurrency, formatDateInZone } from '@/lib/utils/format';
import type { NoShowItem } from '@/lib/api/no-shows';

const OWING_STATUSES = new Set(['unresolved', 'failed', 'pending_payment']);

function statusMeta(status: NoShowItem['status']): { label: string; tone: 'red' | 'amber' | 'green' | 'muted' } {
  switch (status) {
    case 'unresolved':
      return { label: 'Owed', tone: 'red' };
    case 'failed':
      return { label: 'Payment failed', tone: 'red' };
    case 'pending_payment':
      return { label: 'Processing', tone: 'amber' };
    case 'paid':
      return { label: 'Paid', tone: 'green' };
    case 'refunded':
      return { label: 'Refunded', tone: 'muted' };
  }
}

function formatScheduled(iso: string): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return formatDateInZone(iso, tz);
  } catch {
    return iso.slice(0, 10);
  }
}

export default function NoShowsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data, isLoading, isError, error, refetch, isRefetching } = useClientNoShows();
  const pay = usePayNoShow();

  const [paying, setPaying] = useState<{
    noShowId: string;
    clientSecret: string;
    amountUsd: number;
    description: string;
  } | null>(null);

  const { owed, resolved, totalOwedAmount } = useMemo(() => {
    const items = data?.items ?? [];
    const o = items.filter((i) => OWING_STATUSES.has(i.status));
    const r = items.filter((i) => !OWING_STATUSES.has(i.status));
    const total = o.reduce((sum, i) => sum + i.amountUsd, 0);
    return { owed: o, resolved: r, totalOwedAmount: total };
  }, [data]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorView error={error} onRetry={refetch} />;

  const handlePay = (item: NoShowItem) => {
    pay.mutate(item.id, {
      onSuccess: (resp) => {
        setPaying({
          noShowId: resp.noShowId,
          clientSecret: resp.clientSecret,
          amountUsd: resp.amountUsd,
          description: `${item.counterparty.name} · ${item.booking.serviceName ?? 'Appointment'}`,
        });
      },
      onError: (err) => showErrorToast(err),
    });
  };

  const handlePaymentSuccess = () => {
    setPaying(null);
    showSuccessToast('Payment received. Thank you!');
    refetch();
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header title="No-Show Payments" onBack={() => router.back()} />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-8"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {owed.length > 0 && (
          <Card
            className="mb-4 p-4 border-0"
            style={{
              backgroundColor: colors.red + '12',
              borderLeftWidth: 3,
              borderLeftColor: colors.red,
            }}
          >
            <View className="flex-row items-start gap-2">
              <Icon name="alert" size={18} color={colors.red} />
              <View className="flex-1">
                <Text className="text-[15px] font-semibold" style={{ color: colors.red }}>
                  {formatCurrency(totalOwedAmount)} owed across {owed.length} no-show{owed.length === 1 ? '' : 's'}
                </Text>
                <Text className="text-[13px] text-secondary mt-[2px] leading-[18px]">
                  Resolve outstanding fees to keep booking with your barbers. 3 or more unresolved no-shows may prevent new bookings.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {owed.length === 0 && resolved.length === 0 && (
          <View className="items-center justify-center py-16">
            <Icon name="check" size={32} color={colors.green} />
            <Text className="text-[16px] font-semibold text-ink mt-3">All clear</Text>
            <Text className="text-[13px] text-secondary mt-1 text-center px-6">
              You have no outstanding no-show fees.
            </Text>
          </View>
        )}

        {owed.length > 0 && (
          <View className="mb-2">
            <Text className="text-[13px] font-semibold text-secondary uppercase tracking-[0.5px] mb-2">
              Outstanding
            </Text>
            {owed.map((item) => {
              const meta = statusMeta(item.status);
              const toneColor =
                meta.tone === 'red' ? colors.red : meta.tone === 'amber' ? colors.secondary : colors.secondary;
              const isProcessing = item.status === 'pending_payment';
              return (
                <Card key={item.id} className="mb-3 p-4">
                  <View className="flex-row items-center gap-3 mb-3">
                    <Avatar
                      name={item.counterparty.name}
                      size={42}
                      uri={item.counterparty.profilePhotoUrl ?? undefined}
                    />
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold text-ink tracking-[-0.2px]">
                        {item.counterparty.name}
                      </Text>
                      <Text className="text-[13px] text-secondary mt-[1px]">
                        {item.booking.serviceName ?? 'Appointment'} · {formatScheduled(item.booking.scheduledAt)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[17px] font-bold text-ink">
                        {formatCurrency(item.amountUsd)}
                      </Text>
                      <Text className="text-[11px] font-semibold mt-[2px]" style={{ color: toneColor }}>
                        {meta.label}
                      </Text>
                    </View>
                  </View>

                  <Btn
                    label={
                      pay.isPending && pay.variables === item.id
                        ? 'Loading...'
                        : isProcessing
                          ? 'Retry payment'
                          : 'Pay now'
                    }
                    full
                    icon="card"
                    onPress={() => handlePay(item)}
                    disabled={pay.isPending}
                  />
                </Card>
              );
            })}
          </View>
        )}

        {resolved.length > 0 && (
          <View className="mt-4">
            <Text className="text-[13px] font-semibold text-secondary uppercase tracking-[0.5px] mb-2">
              History
            </Text>
            {resolved.map((item) => {
              const meta = statusMeta(item.status);
              const toneColor =
                meta.tone === 'green' ? colors.green : colors.secondary;
              return (
                <Card key={item.id} className="mb-2 p-3">
                  <View className="flex-row items-center gap-3">
                    <Avatar
                      name={item.counterparty.name}
                      size={36}
                      uri={item.counterparty.profilePhotoUrl ?? undefined}
                    />
                    <View className="flex-1">
                      <Text className="text-[14px] font-semibold text-ink">
                        {item.counterparty.name}
                      </Text>
                      <Text className="text-[12px] text-tertiary mt-[1px]">
                        {item.booking.serviceName ?? 'Appointment'} · {formatScheduled(item.booking.scheduledAt)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[14px] font-semibold text-ink">
                        {formatCurrency(item.amountUsd)}
                      </Text>
                      <Text className="text-[11px] font-semibold mt-[2px]" style={{ color: toneColor }}>
                        {meta.label}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      <StripePaymentIntentSheet
        visible={paying !== null}
        clientSecret={paying?.clientSecret ?? null}
        amountUsd={paying?.amountUsd ?? 0}
        description={paying?.description ?? 'No-show fee'}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setPaying(null)}
        onError={(msg) => showToast({ variant: 'error', message: msg })}
      />
    </SafeAreaView>
  );
}
