import { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  useClientNoShows,
  usePayNoShow,
  useReconcileNoShow,
  useRealtimeNoShows,
} from '@/lib/hooks/useNoShows';
import { useColors } from '@/lib/theme/colors';
import { showErrorToast, showSuccessToast, showToast } from '@/lib/feedback/toast';
import { formatCurrency, formatDateInZone } from '@/lib/utils/format';
import {
  IN_FLIGHT_NO_SHOW_STATUSES,
  OWING_NO_SHOW_STATUSES,
  TERMINAL_NO_SHOW_STATUSES,
  type NoShowItem,
  type NoShowStatus,
} from '@/lib/api/no-shows';
import * as noShowsApi from '@/lib/api/no-shows';
import { useSavedCard } from '@/lib/stores/payment-method';

// ── Status → UX mapping ──────────────────────────────────────────
// Truthful, contextual labels per state. Never collapses to a generic
// "Processing".
function statusMeta(status: NoShowStatus): {
  label: string;
  tone: 'red' | 'amber' | 'green' | 'muted' | 'blue';
} {
  switch (status) {
    case 'unresolved':
    case 'failed':
    case 'payment_failed':
      return { label: 'Owed', tone: 'red' };
    case 'reconciliation_required':
      return { label: 'Verifying', tone: 'amber' };
    case 'payment_intent_created':
      return { label: 'Awaiting payment', tone: 'amber' };
    case 'requires_action':
      return { label: 'Bank verification needed', tone: 'amber' };
    case 'processing':
    case 'pending_payment':
      return { label: 'Finalizing payment', tone: 'blue' };
    case 'paid':
      return { label: 'Paid', tone: 'green' };
    case 'refunded':
      return { label: 'Refunded', tone: 'muted' };
    case 'canceled':
      return { label: 'Cancelled', tone: 'muted' };
  }
}

function payButtonLabel(item: NoShowItem, isPayingThisRow: boolean): string {
  if (isPayingThisRow) return 'Loading…';
  if ((IN_FLIGHT_NO_SHOW_STATUSES as string[]).includes(item.status)) {
    if (item.status === 'requires_action') return 'Complete verification';
    if (item.status === 'payment_intent_created') return 'Resume payment';
    return 'Settling…';
  }
  if (item.status === 'payment_failed' || item.status === 'failed') return 'Retry payment';
  return 'Pay now';
}

function isPayable(status: NoShowStatus): boolean {
  // Can the user tap "Pay" to (re)initiate? Block while in-flight and
  // terminal states. Failed/owed states allow retry.
  if ((TERMINAL_NO_SHOW_STATUSES as string[]).includes(status)) return false;
  if ((IN_FLIGHT_NO_SHOW_STATUSES as string[]).includes(status)) {
    // requires_action is "actionable" by reopening the 3DS sheet; the
    // backend will hand us back the same client_secret.
    return status === 'requires_action' || status === 'payment_intent_created';
  }
  return (OWING_NO_SHOW_STATUSES as string[]).includes(status);
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
  const reconcile = useReconcileNoShow();
  const savedCard = useSavedCard();

  // Mount realtime subscription so webhook-driven updates push into the
  // cache without polling. Falls back to polling/reconcile when realtime
  // misses an event.
  useRealtimeNoShows();

  const [paying, setPaying] = useState<{
    noShowId: string;
    clientSecret: string;
    amountUsd: number;
    description: string;
  } | null>(null);

  // Tracks "this row is mid-settlement on the client" so we can disable
  // its pay button immediately and survive realtime/poll noise.
  const settlingIds = useRef<Set<string>>(new Set());

  const owingStatusSet = useMemo(() => new Set<string>(OWING_NO_SHOW_STATUSES), []);
  const inFlightStatusSet = useMemo(() => new Set<string>(IN_FLIGHT_NO_SHOW_STATUSES), []);

  const { owed, settling, resolved, totalOwedAmount } = useMemo(() => {
    const items = data?.items ?? [];
    const o: NoShowItem[] = [];
    const s: NoShowItem[] = [];
    const r: NoShowItem[] = [];
    for (const it of items) {
      if (owingStatusSet.has(it.status)) o.push(it);
      else if (inFlightStatusSet.has(it.status)) s.push(it);
      else r.push(it);
    }
    return { owed: o, settling: s, resolved: r, totalOwedAmount: o.reduce((n, i) => n + i.amountUsd, 0) };
  }, [data, owingStatusSet, inFlightStatusSet]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorView error={error} onRetry={refetch} />;

  const handlePay = (item: NoShowItem) => {
    if (settlingIds.current.has(item.id) || pay.isPending) return;
    settlingIds.current.add(item.id);
    pay.mutate(item.id, {
      onSuccess: (resp) => {
        // Stripe may have returned a synchronous succeeded PI for saved
        // cards (rare for new card capture, but defensive). If so, skip
        // the sheet and go straight to the settle flow.
        if (resp.status === 'paid') {
          settlingIds.current.delete(item.id);
          showSuccessToast('Payment received successfully.');
          refetch();
          return;
        }
        setPaying({
          noShowId: resp.noShowId,
          clientSecret: resp.clientSecret,
          amountUsd: resp.amountUsd,
          description: `${item.counterparty.name} · ${item.booking.serviceName ?? 'Appointment'}`,
        });
      },
      onError: (err) => {
        settlingIds.current.delete(item.id);
        showErrorToast(err);
      },
    });
  };

  // After Stripe confirmCardPayment resolves, the row's terminal status
  // is written by the webhook. We bounded-poll the list, falling back to
  // an authoritative reconcile against Stripe at the midpoint and again
  // at the end. Realtime usually beats this to the punch.
  const handlePaymentSuccess = async () => {
    const noShowId = paying?.noShowId;
    setPaying(null);
    if (!noShowId) return;

    showSuccessToast('Payment submitted. Confirming with your bank…');

    const start = Date.now();
    const HARD_DEADLINE_MS = 25_000;
    const POLL_INTERVAL_MS = 1_500;
    let reconciledOnce = false;
    let reconciledTwice = false;

    while (Date.now() - start < HARD_DEADLINE_MS) {
      const elapsed = Date.now() - start;

      // Midpoint: ask the API to verify against Stripe directly. Cheap
      // single retrieve call; self-heals webhook gaps.
      if (!reconciledOnce && elapsed > 6_000) {
        reconciledOnce = true;
        try { await reconcile.mutateAsync(noShowId); } catch {}
      }
      // Final attempt before showing the "still settling" copy.
      if (!reconciledTwice && elapsed > 18_000) {
        reconciledTwice = true;
        try { await reconcile.mutateAsync(noShowId); } catch {}
      }

      const fresh = await refetch();
      const row = fresh.data?.items.find((i) => i.id === noShowId);
      const status = row?.status;
      if (!status || status === 'paid') {
        settlingIds.current.delete(noShowId);
        if (status === 'paid') showSuccessToast('Payment received successfully.');
        return;
      }
      if (status === 'payment_failed' || status === 'failed') {
        settlingIds.current.delete(noShowId);
        showToast({
          variant: 'error',
          message: 'Payment could not be completed. No charge was finalized.',
        });
        return;
      }
      if (status === 'canceled') {
        settlingIds.current.delete(noShowId);
        showToast({ variant: 'info', message: 'Payment was cancelled.' });
        return;
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    // Deadline hit. Tell the truth — the payment is still settling with
    // the bank; realtime/poll will flip the row when it lands. Do NOT
    // reset to unpaid; do NOT claim failure.
    settlingIds.current.delete(noShowId);
    showToast({
      variant: 'info',
      message:
        "Your bank is still confirming this payment. We'll update this automatically shortly.",
    });
  };

  // If the user lands on the screen with rows already stuck in-flight
  // from a previous session (e.g. app killed mid-3DS), kick off a single
  // best-effort reconcile per row so the UI doesn't appear stuck.
  useEffect(() => {
    if (!data?.items) return;
    for (const it of data.items) {
      if (inFlightStatusSet.has(it.status) && !settlingIds.current.has(it.id)) {
        settlingIds.current.add(it.id);
        noShowsApi
          .reconcileNoShow(it.id)
          .catch(() => undefined)
          .finally(() => {
            settlingIds.current.delete(it.id);
            refetch();
          });
      }
    }
    // run only when the row id set changes
  }, [data?.items?.map((i) => i.id).join('|'), inFlightStatusSet, refetch]);

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
                  {formatCurrency(totalOwedAmount)} owed across {owed.length} no-show
                  {owed.length === 1 ? '' : 's'}
                </Text>
                <Text className="text-[13px] text-secondary mt-[2px] leading-[18px]">
                  Resolve outstanding fees to keep booking with your barbers. 3 or more
                  unresolved no-shows may prevent new bookings.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {owed.length === 0 && settling.length === 0 && resolved.length === 0 && (
          <View className="items-center justify-center py-16">
            <Icon name="check" size={32} color={colors.green} />
            <Text className="text-[16px] font-semibold text-ink mt-3">All clear</Text>
            <Text className="text-[13px] text-secondary mt-1 text-center px-6">
              You have no outstanding no-show fees.
            </Text>
          </View>
        )}

        {owed.length > 0 && (
          <Section title="Outstanding">
            {owed.map((item) => (
              <PayableRow
                key={item.id}
                item={item}
                onPay={() => handlePay(item)}
                disabled={
                  !isPayable(item.status) ||
                  settlingIds.current.has(item.id) ||
                  (pay.isPending && pay.variables === item.id)
                }
                payingThis={pay.isPending && pay.variables === item.id}
              />
            ))}
          </Section>
        )}

        {settling.length > 0 && (
          <Section title="Settling">
            {settling.map((item) => (
              <PayableRow
                key={item.id}
                item={item}
                onPay={() => handlePay(item)}
                disabled={
                  !isPayable(item.status) ||
                  settlingIds.current.has(item.id) ||
                  (pay.isPending && pay.variables === item.id)
                }
                payingThis={pay.isPending && pay.variables === item.id}
              />
            ))}
          </Section>
        )}

        {resolved.length > 0 && (
          <Section title="History" mt>
            {resolved.map((item) => (
              <HistoryRow key={item.id} item={item} />
            ))}
          </Section>
        )}
      </ScrollView>

      <StripePaymentIntentSheet
        visible={paying !== null}
        clientSecret={paying?.clientSecret ?? null}
        amountUsd={paying?.amountUsd ?? 0}
        description={paying?.description ?? 'No-show fee'}
        savedCard={savedCard}
        onSuccess={handlePaymentSuccess}
        onCancel={() => {
          const id = paying?.noShowId;
          setPaying(null);
          if (id) settlingIds.current.delete(id);
        }}
        onError={(msg) => {
          showToast({ variant: 'error', message: msg });
        }}
        onRequiresAction={() => {
          // Stripe completed the SCA challenge inside the sheet — keep
          // the sheet open until the JS layer reports success/error.
        }}
      />
    </SafeAreaView>
  );
}

function Section({
  title,
  mt,
  children,
}: {
  title: string;
  mt?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className={mt ? 'mt-4' : 'mb-2'}>
      <Text className="text-[13px] font-semibold text-secondary uppercase tracking-[0.5px] mb-2">
        {title}
      </Text>
      {children}
    </View>
  );
}

function PayableRow({
  item,
  onPay,
  disabled,
  payingThis,
}: {
  item: NoShowItem;
  onPay: () => void;
  disabled: boolean;
  payingThis: boolean;
}) {
  const colors = useColors();
  const meta = statusMeta(item.status);
  const toneColor =
    meta.tone === 'red'
      ? colors.red
      : meta.tone === 'green'
        ? colors.green
        : meta.tone === 'blue'
          ? colors.blue ?? colors.brand
          : colors.secondary;

  return (
    <Card className="mb-3 p-4">
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
            {item.booking.serviceName ?? 'Appointment'} ·{' '}
            {formatScheduled(item.booking.scheduledAt)}
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
        label={payButtonLabel(item, payingThis)}
        full
        icon="card"
        onPress={onPay}
        disabled={disabled}
      />
    </Card>
  );
}

function HistoryRow({ item }: { item: NoShowItem }) {
  const colors = useColors();
  const meta = statusMeta(item.status);
  const toneColor =
    meta.tone === 'green'
      ? colors.green
      : meta.tone === 'red'
        ? colors.red
        : colors.secondary;
  return (
    <Card className="mb-2 p-3">
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
            {item.booking.serviceName ?? 'Appointment'} ·{' '}
            {formatScheduled(item.booking.scheduledAt)}
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
}
